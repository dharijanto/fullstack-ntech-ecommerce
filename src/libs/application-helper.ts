import * as AppConfig from '../app-config'

import * as Promise from 'bluebird'

// Help ensure AppConfig is configured properly
export function validateApplicationConfig (): Promise<NCResponse<null>> {
  try {
    const serverType = getServerType()
    return Promise.resolve({ status: true })
  } catch (err) {
    return Promise.reject(err)
  }
}

export type ServerType = 'CLOUD_ONLY' | 'CLOUD_SERVER' | 'ON_PREMISE'
// Throw an error if SERVER_TYPE is not set properly
export function getServerType (): ServerType {
  switch (AppConfig.SERVER_TYPE) {
    case 'CLOUD_ONLY':
      return 'CLOUD_ONLY' as ServerType
    case 'ON_PREMISE':
      return 'ON_PREMISE' as ServerType
    case 'CLOUD_SERVER':
      return 'CLOUD_SERVER' as ServerType
    default:
      throw new Error('SERVER_TYPE is not recognized: ' + AppConfig.SERVER_TYPE + ' please contact system administrator')
  }
}
