import * as core from '@actions/core'
import * as exec from '@actions/exec';
const fetch = require("node-fetch");

async function getDockerRegistryToken(username: string, password: string): Promise<string> {
  const url = 'https://hub.docker.com/v2/users/login/';
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      'username': username,
      'password': password
    })
  };

  return fetch(url, options)
    .then((response: any) => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json().then((data: DockerLoginResponse) => data.token);
    })
}


async function run(): Promise<void> {
  try {
    const dockerUsername: string = core.getInput('username')
    const dockerPassword: string = core.getInput('password')
    const dockerRegistry: string = core.getInput('registry')
    const sourceTag: string = core.getInput('sourceTag')
    const paths: string[] = core.getMultilineInput('newTags', { required: true });

    const token = getDockerRegistryToken(dockerUsername, dockerPassword)

    core.debug(await token)

    core.setOutput('token', await token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

export class DockerLoginResponse {
  token: string;

  constructor(
    token: string,
  ) {
    this.token = token
  }
}

run()
