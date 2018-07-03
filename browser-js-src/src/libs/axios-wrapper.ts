import axios from 'axios'
import Config from '../config'

export default axios.create({
  timeout: Config.NETWORK_TIMEOUT
})
