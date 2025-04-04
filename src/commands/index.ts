/**
 * Copyright (C) 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the ""License"");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an ""AS IS"" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import {ClusterCommand} from './cluster.js';
import {ContextCommand} from './context/index.js';
import {InitCommand} from './init.js';
import {MirrorNodeCommand} from './mirror_node.js';
import {NetworkCommand} from './network.js';
import {NodeCommand} from './node/index.js';
import {RelayCommand} from './relay.js';
import {AccountCommand} from './account.js';
import {DeploymentCommand} from './deployment.js';
import {type Opts} from '../types/command_types.js';

/**
 * Return a list of Yargs command builder to be exposed through CLI
 * @param opts it is an Options object containing logger
 * @returns an array of Yargs command builder
 */
export function Initialize(opts: Opts) {
  const initCmd = new InitCommand(opts);
  const clusterCmd = new ClusterCommand(opts);
  const contextCmd = new ContextCommand(opts);
  const networkCommand = new NetworkCommand(opts);
  const nodeCmd = new NodeCommand(opts);
  const relayCmd = new RelayCommand(opts);
  const accountCmd = new AccountCommand(opts);
  const mirrorNodeCmd = new MirrorNodeCommand(opts);
  const deploymentCommand = new DeploymentCommand(opts);

  return [
    initCmd.getCommandDefinition(),
    accountCmd.getCommandDefinition(),
    clusterCmd.getCommandDefinition(),
    contextCmd.getCommandDefinition(),
    networkCommand.getCommandDefinition(),
    nodeCmd.getCommandDefinition(),
    relayCmd.getCommandDefinition(),
    mirrorNodeCmd.getCommandDefinition(),
    deploymentCommand.getCommandDefinition(),
  ];
}
