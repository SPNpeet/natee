// cPanel/Passenger startup entry. Build on GitHub; no runtime dependencies.
import('./node-host/server.mjs').catch(()=>{console.error('Natee startup failed: check Node version, SITE_URL, DATA_DIR and database permissions');process.exit(1)})
