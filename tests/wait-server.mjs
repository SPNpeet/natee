for(let i=0;i<60;i++){
  try{const response=await fetch('http://127.0.0.1:8787/api/session');if(response.ok)process.exit(0)}catch{}
  await new Promise(resolve=>setTimeout(resolve,1000))
}
throw new Error('Worker did not become ready within 60 seconds')
