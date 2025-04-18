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
import {Flags as flags} from '../../commands/flags.js';
import type {ConfigManager} from '../config_manager.js';
import type {K8} from '../k8.js';
import type {SoloLogger} from '../logging.js';
import {type Lease, type LeaseRenewalService} from './lease.js';
import {IntervalLease} from './interval_lease.js';
import {LeaseHolder} from './lease_holder.js';
import {LeaseAcquisitionError} from './lease_errors.js';

/**
 * Manages the acquisition and renewal of leases.
 */
export class LeaseManager {
  /** The injected logger instance. */
  private readonly _logger: SoloLogger;

  /** The injected lease renewal service instance. */
  private readonly _renewalService: LeaseRenewalService;

  /**
   * Creates a new lease manager.
   *
   * @param k8 - the Kubernetes client.
   * @param configManager - the configuration manager.
   * @param logger - the logger.
   * @param renewalService - the lease renewal service.
   */
  constructor(
    private readonly k8: K8,
    private readonly configManager: ConfigManager,
    logger: SoloLogger,
    renewalService: LeaseRenewalService,
  ) {
    if (!k8) throw new MissingArgumentError('an instance of core/K8 is required');
    if (!logger) throw new MissingArgumentError('an instance of core/SoloLogger is required');
    if (!configManager) throw new MissingArgumentError('an instance of core/ConfigManager is required');
    if (!renewalService) throw new MissingArgumentError('an instance of core/LeaseRenewalService is required');

    this._logger = logger;
    this._renewalService = renewalService;
  }

  /**
   * Creates a new lease. This lease is not acquired until the `acquire` method is called.
   *
   * @returns a new lease instance.
   */
  public async create(): Promise<Lease> {
    return new IntervalLease(this.k8, this._renewalService, LeaseHolder.default(), await this.currentNamespace());
  }

  /**
   * Retrieves the renewal service implementation.
   *
   * @returns the lease renewal service.
   */
  public get renewalService(): LeaseRenewalService {
    return this._renewalService;
  }

  /**
   * Retrieves the logger instance.
   *
   * @returns the logger.
   */
  public get logger(): SoloLogger {
    return this._logger;
  }

  /**
   * Retrieves the user or configuration supplied namespace to use for lease acquisition.
   *
   * @returns the namespace to use for lease acquisition or null if no namespace is specified.
   * @throws LeaseAcquisitionError if the namespace does not exist and cannot be created.
   */
  private async currentNamespace(): Promise<string> {
    const deploymentNamespace = this.configManager.getFlag<string>(flags.namespace);
    const clusterSetupNamespace = this.configManager.getFlag<string>(flags.clusterSetupNamespace);

    if (!deploymentNamespace && !clusterSetupNamespace) {
      return null;
    }
    const namespace = deploymentNamespace ? deploymentNamespace : clusterSetupNamespace;

    if (!(await this.k8.hasNamespace(namespace))) {
      await this.k8.createNamespace(namespace);

      if (!(await this.k8.hasNamespace(namespace))) {
        throw new LeaseAcquisitionError(`failed to create the '${namespace}' namespace`);
      }
    }

    return namespace;
  }
}
