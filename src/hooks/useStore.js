import { useState, useEffect, useCallback } from 'react';
import { STORE_PREFIX } from '../data/constants';
import { api } from '../api';

function readJson(key, fallback) {
  try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}

export function useStore(formKey) {
  const key = STORE_PREFIX + formKey;
  const deleteKey = `${key}-pending-deletes`;
  const [db, setDb] = useState(() => {
    const x=readJson(key,{records:[]}); return x && Array.isArray(x.records)?x:{records:[]};
  });
  const [saveState, setSaveState] = useState('Connecting…');

  const cache = useCallback((next) => { try { localStorage.setItem(key, JSON.stringify(next)); } catch {} }, [key]);
  const readDeletes = useCallback(() => {
    const x=readJson(deleteKey,[]); return Array.isArray(x)?x:[];
  }, [deleteKey]);
  const writeDeletes = useCallback((ids) => {
    try { localStorage.setItem(deleteKey, JSON.stringify([...new Set(ids)])); } catch {}
  }, [deleteKey]);

  useEffect(() => {
    let alive=true;
    (async()=>{
      try {
        let remote=await api.listRecords(formKey);
        if (!alive) return;
        let remoteRecords=Array.isArray(remote.records)?remote.records:[];

        // Complete pending offline deletes first, preventing deleted records from being resurrected.
        const pendingDeletes=readDeletes();
        const failedDeletes=[];
        for (const id of pendingDeletes) {
          try { await api.deleteRecord(formKey,id); remoteRecords=remoteRecords.filter(r=>r.id!==id); }
          catch { failedDeletes.push(id); }
        }
        writeDeletes(failedDeletes);

        const localRecords=readJson(key,{records:[]}).records || [];
        const merged=new Map(remoteRecords.map(r=>[r.id,r]));
        for (const r of localRecords) {
          if (failedDeletes.includes(r.id) || pendingDeletes.includes(r.id)) continue;
          const server=merged.get(r.id);
          if (!server || Number(r.updated||0)>Number(server.updated||0)) merged.set(r.id,r);
        }
        const next={records:[...merged.values()]};
        setDb(next); cache(next);

        const remoteById=new Map(remoteRecords.map(r=>[r.id,r]));
        const pending=next.records.filter(r=>!remoteById.has(r.id)||Number(r.updated||0)>Number(remoteById.get(r.id)?.updated||0));
        let failed=0;
        // Sequential sync avoids concurrent write races and gives deterministic field-survey recovery.
        for (const r of pending) { try { await api.saveRecord(formKey,r); } catch { failed++; } }
        if (alive) setSaveState(failed ? `⚠ Connected · ${failed} item(s) pending sync` : '✓ API connected');
      } catch {
        if (alive) setSaveState('⚠ Offline — using local cache');
      }
    })();
    return()=>{alive=false;};
  },[formKey,cache,key,readDeletes,writeDeletes]);

  const saveRecord=useCallback(async(rec)=>{
    setSaveState('Saving to API…');
    const cacheRecord = () => {
      setDb(prev=>{
        const records=[...prev.records]; const i=records.findIndex(x=>x.id===rec.id);
        if(i>=0) records[i]=rec; else records.push(rec);
        const next={records}; cache(next); return next;
      });
    };
    try {
      await api.saveRecord(formKey,rec);
      cacheRecord();
      setSaveState('✓ Saved to API '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}));
      return {ok:true,source:'api'};
    } catch (err) {
      // Validation/conflict responses are real server rejections, not offline failures.
      // Do not create a local record that can never synchronize.
      if (Number(err?.status) >= 400 && Number(err?.status) < 500) {
        setSaveState('✗ Not saved — '+err.message);
        return {ok:false,source:'rejected',error:err.message};
      }
      cacheRecord();
      setSaveState('⚠ API unavailable — saved locally; sync pending');
      return {ok:false,source:'local',error:err?.message || 'API unavailable'};
    }
  },[formKey,cache]);

  const deleteRecord=useCallback(async(id)=>{
    setDb(prev=>{const next={records:prev.records.filter(x=>x.id!==id)};cache(next);return next;});
    try {
      await api.deleteRecord(formKey,id);
      writeDeletes(readDeletes().filter(x=>x!==id));
      setSaveState('✓ Deleted from API');
      return {ok:true};
    } catch {
      writeDeletes([...readDeletes(),id]);
      setSaveState('⚠ Deleted locally · server delete pending');
      return {ok:false};
    }
  },[formKey,cache,readDeletes,writeDeletes]);

  const clearAll=useCallback(async()=>{
    const ids=db.records.map(r=>r.id); const next={records:[]}; setDb(next); cache(next);
    try { await api.clearRecords(formKey); writeDeletes([]); setSaveState('✓ Cleared'); }
    catch { writeDeletes([...readDeletes(),...ids]); setSaveState('⚠ Cleared locally · server clear pending'); }
  },[formKey,cache,db.records,readDeletes,writeDeletes]);

  return {db,setDb,saveRecord,deleteRecord,clearAll,saveState,setSaveState};
}

export function useSession() {
  const key=STORE_PREFIX+'session';
  const initial={villageCode:'',village:'',wadi:'',date:new Date().toISOString().slice(0,10),taluka:'Vaibhavwadi',district:'Sindhudurg',interviewer:''};
  const [session,setSession]=useState(()=>readJson(key,initial)||initial);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(session));}catch{}},[session,key]);
  return [session,setSession];
}
