import { after } from 'node:test'

import './login.test.js'
import './user_api.test.js'
import './channel_api.test.js'
import './friend_api.test.js'

after(() => process.exit())
