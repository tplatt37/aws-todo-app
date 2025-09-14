import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

import { FeatureFlags } from './types';

// Initialize SSM Client
const ssmClient = new SSMClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const PARAMETER_PATH = '/todoapp/dev/';

/**
 * Fetches feature flags from AWS Parameter Store
 * Parameters should be stored with path prefix '/todoapp/dev/'
 * Parameter values should be string 'true' or 'false'
 */
export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  try {
    const command = new GetParametersByPathCommand({
      Path: PARAMETER_PATH,
      Recursive: true,
    });

    const response = await ssmClient.send(command);
    const featureFlags: FeatureFlags = {};

    if (response.Parameters) {
      for (const parameter of response.Parameters) {
        if (parameter.Name && parameter.Value) {
          // Remove the path prefix to get clean flag name
          const flagName = parameter.Name.replace(PARAMETER_PATH, '');
          
          // Convert string value to boolean
          const flagValue = parameter.Value.toLowerCase() === 'true';
          
          featureFlags[flagName] = flagValue;
        }
      }
    }

    console.log('Feature flags loaded:', featureFlags);
    return featureFlags;
  } catch (error) {
    console.error('Failed to fetch feature flags from Parameter Store:', error);
    // Return empty object on error - app should continue to work
    return {};
  }
}
