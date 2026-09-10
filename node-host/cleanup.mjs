import worker from '../node-build/worker.mjs'
import {createEnvironment} from './environment.mjs'
process.umask(0o077)
const env=await createEnvironment()
try{await worker.scheduled({},env);console.log('Scheduled cleanup complete')}finally{env.DB.close()}
