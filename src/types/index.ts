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
import type * as x509 from '@peculiar/x509';
import type net from 'net';
import type * as WebSocket from 'ws';
import type crypto from 'crypto';
import type {ListrTask} from 'listr2';

// NOTE: DO NOT add any Solo imports in this file to avoid circular dependencies

export interface NodeKeyObject {
  privateKey: crypto.webcrypto.CryptoKey;
  certificate: x509.X509Certificate;
  certificateChain: x509.X509Certificates;
}

export interface PrivateKeyAndCertificateObject {
  privateKeyFile: string;
  certificateFile: string;
}

export interface ExtendedNetServer extends net.Server {
  localPort: number;
  info: string;
}

export interface LocalContextObject {
  reject: (reason?: any) => void;
  connection: WebSocket.WebSocket;
  errorMessage: string;
}

export interface AccountIdWithKeyPairObject {
  accountId: string;
  privateKey: string;
  publicKey: string;
}

/**
 * Generic type for representing optional types
 */
export type Optional<T> = T | undefined;

/**
 * Interface for capsuling validating for class's own properties
 */
export interface Validate {
  /**
   * Validates all properties of the class and throws if data is invalid
   */
  validate(): void;
}

/**
 * Interface for converting a class to a plain object.
 */
export interface ToObject<T> {
  /**
   * Converts the class instance to a plain object.
   *
   * @returns the plain object representation of the class.
   */
  toObject(): T;
}

export type SoloListrTask<T> = ListrTask<T, any, any>;

export type EmptyContextConfig = object;
