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

import {MissingArgumentError} from '../errors.js';
import os from 'node:os';
import process from 'node:process';

/**
 * A representation of a leaseholder who is identified by a username, hostname, and process id (PID). This implementation
 * is serializable to/from a JSON object and is comparable to other leaseholders.
 */
export class LeaseHolder {
  /** The user's identity which is typically the OS login username. */
  private readonly _username: string;

  /** The machine's identity which is typically the hostname. */
  private readonly _hostname: string;

  /** The process identifier which is typically the OS PID. */
  private readonly _processId: number;

  /**
   * Constructs a new leaseholder with the given username, hostname, and process id. This constructor is private and
   * should not be called directly. Use the static factory methods to create a new instance.
   *
   * @param username - the user's identity.
   * @param hostname - the machine's identity.
   * @param processId - the process identifier.
   */
  private constructor(username: string, hostname: string, processId: number) {
    if (!username) throw new MissingArgumentError('username is required');
    if (!hostname) throw new MissingArgumentError('hostname is required');
    if (!processId) throw new MissingArgumentError('pid is required');

    this._username = username;
    this._hostname = hostname;
    this._processId = processId;
  }

  /**
   * Creates a new leaseholder with the given username. The hostname is set to the current machine's hostname and the
   * process id is set to the current process's PID.
   * @param username - the user's identity.
   * @returns a new leaseholder instance.
   */
  public static of(username: string): LeaseHolder {
    return new LeaseHolder(username, os.hostname(), process.pid);
  }

  /**
   * Creates a new leaseholder by retrieving the current user's identity, the current machine's hostname, and the
   * current process's PID.
   * @returns a new leaseholder instance.
   */
  public static default(): LeaseHolder {
    return LeaseHolder.of(os.userInfo().username);
  }

  /**
   * The user's identity which is typically the OS login username.
   * @returns the user's identity.
   */
  public get username(): string {
    return this._username;
  }

  /**
   * The machine's identity which is typically the hostname.
   * @returns the machine's identity.
   */
  public get hostname(): string {
    return this._hostname;
  }

  /**
   * The process identifier which is typically the OS PID.
   * @returns the process identifier.
   */
  public get processId(): number {
    return this._processId;
  }

  /**
   * Returns a plain object representation of this leaseholder. This object may be serialized to JSON.
   * @returns a plain object representation of this leaseholder.
   */
  public toObject(): any {
    return {
      username: this._username,
      hostname: this._hostname,
      pid: this._processId,
    };
  }

  /**
   * Compares this leaseholder to another leaseholder to determine if they are equal. Two leaseholders are equal if
   * their username, hostname, and process id are the same.
   * @param other - the other leaseholder to compare.
   * @returns true if the leaseholders are equal; false otherwise.
   */
  public equals(other: LeaseHolder): boolean {
    return this.username === other.username && this.hostname === other.hostname && this.processId === other.processId;
  }

  /**
   * Compares this leaseholder to another leaseholder to determine if they are the same machine. Two leaseholders are
   * the same machine if their username and hostname are the same.
   * @param other - the other leaseholder to compare.
   * @returns true if the leaseholders are the same machine; false otherwise.
   */
  public isSameMachineIdentity(other: LeaseHolder): boolean {
    return this.username === other.username && this.hostname === other.hostname;
  }

  /**
   * Determines if the process associated with this leaseholder is still alive. This method will return false if the
   * process is not alive or an error occurs while checking the process status.
   * @returns true if the process is alive; false otherwise.
   */
  public isProcessAlive(): boolean {
    try {
      return process.kill(this.processId, 0);
    } catch (e: any) {
      return e.code === 'EPERM';
    }
  }

  /**
   * Serializes this leaseholder to a JSON string representation.
   * @returns a JSON string representation of this leaseholder.
   */
  public toJson(): string {
    return JSON.stringify(this.toObject());
  }

  /**
   * Deserializes a JSON string representation of a leaseholder into a new leaseholder instance.
   * @param json - the JSON string representation of a leaseholder.
   * @returns a new leaseholder instance.
   */
  public static fromJson(json: string): LeaseHolder {
    const obj: ReturnType<LeaseHolder['toObject']> = JSON.parse(json);
    return new LeaseHolder(obj.username, obj.hostname, obj.pid);
  }
}
