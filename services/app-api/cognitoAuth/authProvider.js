import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Result, ok, err } from 'neverthrow'

export function parseAuthProvider(authProvider) {
    // Result<{ userId: string; poolId: string }, Error>
    // Cognito authentication provider looks like:
    // cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
    try {
      const parts = authProvider.split(':')
      const userPoolIdParts = parts[parts.length - 3].split('/')
      const userPoolId = userPoolIdParts[userPoolIdParts.length - 1] // Where us-east-1_aaaaaaaaa is the User Pool id
      const userPoolUserId = parts[parts.length - 1] // And qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr is the User Pool User Id
  
      console.log(`userId: ${userPoolUserId}`)
      console.log(`poolId: ${userPoolId}`)
  
      return ok({ userId: userPoolUserId, poolId: userPoolId })
    } catch (e) {
      // console.log(e)
      return err(new Error('authProvider doesnt have enough parts'))
    }
}

//check again
export function userAttrDict(cognitouser) {
    let attributes = {}
    if(cognitouser.UserAttributes) {
        cognitouser.UserAttributes.forEach((e) => {
            if (e.Value) {
                console.log(`attributes: ${e}, ${e.Value}`)
                // attributes{e.Name} = attribute.Value
            }
        })
    }
    console.log(`attributes: ${attributes}`)
    return attributes;
}

// userFromCognitoAuthProvider hits the Cogntio API to get the information in the authProvider
export async function userFromCognitoAuthProvider(authProvider) {
    const parseResult = parseAuthProvider(authProvider)
    if (parseResult.isErr()) {
        return err(parseResult.error)
    }
  
    const userInfo = parseResult.value
  
    // calling a dependency so we have to try
    try {
        const cognito = new CognitoIdentityServiceProvider()
        const userResponse = await cognito
            .adminGetUser({
                Username: userInfo.userId,
                UserPoolId: userInfo.poolId,
            })
            .promise()
  
        // we lose type safety here...
        const attributes = userAttrDict(userResponse)
        console.log(attributes)
  
        if (
            !(
                'email' in attributes &&
                'given_name' in attributes &&
                'family_name' in attributes &&
                'custom:ismemberof' in attributes
            )
        ) {
            return err(
                new Error(
                    'User does not have all the expected attributes: ' +
                        JSON.stringify(attributes)
                )
            )
        }
        const user = {
            email: attributes.email,
            given_name: attributes.given_name,
            family_name: attributes.family_name,
            state: attributes['custom:ismemberof']
        }
  
        return ok(user)
    } catch (e) {
        return err(e)
    }
}