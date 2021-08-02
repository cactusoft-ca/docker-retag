import * as core from '@actions/core'
import * as exec from '@actions/exec';
const fetch = require("node-fetch");
import * as dockerApi from "./dockerV2Api";

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

async function GetListOftags(repoName: string, token: string): Promise<dockerApi.Images> {
  const url: string = `https://hub.docker.com/v2/repositories/${repoName}/tags/?page_size=10000`;
  core.debug(`URL: ${url}`)

  return fetch(url, {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': `JWT ${token}`
    }
  }).then((response: any) => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    core.debug(`Response: ${response.json()}`)
    response.json().then((data: dockerApi.Images) => data);
  })
}

async function installDockerRetag() {
  await exec.getExecOutput('wget', ['-q', 'https://github.com/joshdk/docker-retag/releases/download/0.0.2/docker-retag', '/usr/bin']);
  await exec.getExecOutput('sudo', ['install', 'docker-retag']);
}

async function run(): Promise<void> {
  try {
    const dockerUsername: string = core.getInput('username');
    const dockerPassword: string = core.getInput('password');
    const dockerRegistry: string = core.getInput('registry');
    const repoName: string = core.getInput('repoName');
    const sourceTag: string = core.getInput('sourceTag');
    const paths: string[] = core.getMultilineInput('newTags', { required: true });

    core.debug('Getting docker registry token');
    const token = await getDockerRegistryToken(dockerUsername, dockerPassword)

    core.debug('Getting docker lsit of tags');
    const images = await GetListOftags(repoName, token)
    const tags = images.results;

    let exists = false;

    for (const path of tags) {
        core.debug(path.name)

        if(path.name === sourceTag){
          exists = true
          break;
        }
    }

    core.setOutput('existing-tag', exists)


    // installDockerRetag();
    // await exec.getExecOutput('export', [`DOCKER_USER${dockerUsername}`]);
    // await exec.getExecOutput('export', [`DOCKER_PASS${dockerPassword}`]);


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

run();