import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir:'tests/browser',workers:1,retries:0,timeout:45000,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:8787',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[
    {name:'chromium',use:{browserName:'chromium'}},
    {name:'firefox',testMatch:/public\.spec\.js/,use:{browserName:'firefox'}},
    {name:'webkit',testMatch:/public\.spec\.js/,use:{browserName:'webkit'}},
  ],
})
