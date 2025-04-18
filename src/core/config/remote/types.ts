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
import type {NodeAliases} from '../../../types/aliases.js';
import type {ComponentType, ConsensusNodeStates} from './enumerations.js';

export type EmailAddress = `${string}@${string}.${string}`;
export type Version = string;
export type Namespace = string;
export type Cluster = string;
export type Context = string;
export type ComponentName = string;

export interface IMigration {
  migratedAt: Date;
  migratedBy: EmailAddress;
  fromVersion: Version;
}

export interface Component {
  name: ComponentName;
  cluster: Cluster;
  namespace: Namespace;
}

export interface IRelayComponent extends Component {
  consensusNodeAliases: NodeAliases;
}

export interface IConsensusNodeComponent extends Component {
  state: ConsensusNodeStates;
}

export type ComponentsDataStructure = Record<ComponentType, Record<ComponentName, Component>>;
