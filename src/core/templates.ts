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
import * as x509 from '@peculiar/x509';
import os from 'os';
import path from 'path';
import {DataValidationError, SoloError, IllegalArgumentError, MissingArgumentError} from './errors.js';
import * as constants from './constants.js';
import {type AccountId} from '@hashgraph/sdk';
import type {IP, NodeAlias, NodeId, PodName} from '../types/aliases.js';
import {GrpcProxyTlsEnums} from './enumerations.js';
import {type ContextClusterStructure} from '../types/config_types.js';
import type {Cluster, Context} from './config/remote/types.js';

export class Templates {
  public static renderNetworkPodName(nodeAlias: NodeAlias): PodName {
    return `network-${nodeAlias}-0`;
  }

  private static renderNetworkSvcName(nodeAlias: NodeAlias): string {
    return `network-${nodeAlias}-svc`;
  }

  private static nodeAliasFromNetworkSvcName(svcName: string): NodeAlias {
    return svcName.split('-').slice(1, -1).join('-') as NodeAlias;
  }

  private static renderNetworkHeadlessSvcName(nodeAlias: NodeAlias): string {
    return `network-${nodeAlias}`;
  }

  public static renderGossipPemPrivateKeyFile(nodeAlias: NodeAlias): string {
    return `${constants.SIGNING_KEY_PREFIX}-private-${nodeAlias}.pem`;
  }

  public static renderGossipPemPublicKeyFile(nodeAlias: NodeAlias): string {
    return `${constants.SIGNING_KEY_PREFIX}-public-${nodeAlias}.pem`;
  }

  public static renderTLSPemPrivateKeyFile(nodeAlias: NodeAlias): string {
    return `hedera-${nodeAlias}.key`;
  }

  public static renderTLSPemPublicKeyFile(nodeAlias: NodeAlias): string {
    return `hedera-${nodeAlias}.crt`;
  }

  public static renderNodeFriendlyName(prefix: string, nodeAlias: NodeAlias, suffix = ''): string {
    const parts = [prefix, nodeAlias];
    if (suffix) parts.push(suffix);
    return parts.join('-');
  }

  private static extractNodeAliasFromPodName(podName: PodName): NodeAlias {
    const parts = podName.split('-');
    if (parts.length !== 3) throw new DataValidationError(`pod name is malformed : ${podName}`, 3, parts.length);
    return parts[1].trim() as NodeAlias;
  }

  static prepareReleasePrefix(tag: string): string {
    if (!tag) throw new MissingArgumentError('tag cannot be empty');

    const parsed = tag.split('.');
    if (parsed.length < 3) throw new Error(`tag (${tag}) must include major, minor and patch fields (e.g. v0.40.4)`);
    return `${parsed[0]}.${parsed[1]}`;
  }

  /**
   * renders the name to be used to store the new account key as a Kubernetes secret
   * @param accountId
   * @returns the name of the Kubernetes secret to store the account key
   */
  public static renderAccountKeySecretName(accountId: AccountId | string): string {
    return `account-key-${accountId.toString()}`;
  }

  /**
   * renders the label selector to be used to fetch the new account key from the Kubernetes secret
   * @param accountId
   * @returns the label selector of the Kubernetes secret to retrieve the account key   */
  public static renderAccountKeySecretLabelSelector(accountId: AccountId | string): string {
    return `solo.hedera.com/account-id=${accountId.toString()}`;
  }

  /**
   * renders the label object to be used to store the new account key in the Kubernetes secret
   * @param accountId
   * @returns the label object to be used to store the new account key in the Kubernetes secret
   */
  public static renderAccountKeySecretLabelObject(accountId: AccountId | string): {
    'solo.hedera.com/account-id': string;
  } {
    return {
      'solo.hedera.com/account-id': accountId.toString(),
    };
  }

  static renderDistinguishedName(
    nodeAlias: NodeAlias,
    state = 'TX',
    locality = 'Richardson',
    org = 'Hedera',
    orgUnit = 'Hedera',
    country = 'US',
  ) {
    return new x509.Name(`CN=${nodeAlias},ST=${state},L=${locality},O=${org},OU=${orgUnit},C=${country}`);
  }

  public static renderStagingDir(cacheDir: string, releaseTag: string): string {
    if (!cacheDir) {
      throw new IllegalArgumentError('cacheDir cannot be empty');
    }

    if (!releaseTag) {
      throw new IllegalArgumentError('releaseTag cannot be empty');
    }

    const releasePrefix = this.prepareReleasePrefix(releaseTag);
    if (!releasePrefix) {
      throw new IllegalArgumentError('releasePrefix cannot be empty');
    }

    return path.resolve(path.join(cacheDir, releasePrefix, 'staging', releaseTag));
  }

  public static installationPath(
    dep: string,
    osPlatform: NodeJS.Platform | string = os.platform(),
    installationDir: string = path.join(constants.SOLO_HOME_DIR, 'bin'),
  ) {
    switch (dep) {
      case constants.HELM:
        if (osPlatform === constants.OS_WINDOWS) {
          return path.join(installationDir, `${dep}.exe`);
        }

        return path.join(installationDir, dep);

      default:
        throw new SoloError(`unknown dep: ${dep}`);
    }
  }

  public static renderFullyQualifiedNetworkPodName(namespace: string, nodeAlias: NodeAlias): string {
    return `${Templates.renderNetworkPodName(nodeAlias)}.${Templates.renderNetworkHeadlessSvcName(nodeAlias)}.${namespace}.svc.cluster.local`;
  }

  public static renderFullyQualifiedNetworkSvcName(namespace: string, nodeAlias: NodeAlias): string {
    return `${Templates.renderNetworkSvcName(nodeAlias)}.${namespace}.svc.cluster.local`;
  }

  private static nodeAliasFromFullyQualifiedNetworkSvcName(svcName: string): NodeAlias {
    const parts = svcName.split('.');
    return this.nodeAliasFromNetworkSvcName(parts[0]);
  }

  public static nodeIdFromNodeAlias(nodeAlias: NodeAlias): NodeId {
    for (let i = nodeAlias.length - 1; i > 0; i--) {
      // @ts-ignore
      if (isNaN(nodeAlias[i])) {
        return parseInt(nodeAlias.substring(i + 1, nodeAlias.length));
      }
    }

    throw new SoloError(`Can't get node id from node ${nodeAlias}`);
  }

  public static renderGossipKeySecretName(nodeAlias: NodeAlias): string {
    return `network-${nodeAlias}-keys-secrets`;
  }

  public static renderGossipKeySecretLabelObject(nodeAlias: NodeAlias): {'solo.hedera.com/node-name': string} {
    return {'solo.hedera.com/node-name': nodeAlias};
  }

  /**
   * Creates the secret name based on the node alias type
   *
   * @param nodeAlias - node alias
   * @param type - whether is for gRPC or gRPC Web ( Haproxy or Envoy )
   *
   * @returns the appropriate secret name
   */
  static renderGrpcTlsCertificatesSecretName(nodeAlias: NodeAlias, type: GrpcProxyTlsEnums) {
    switch (type) {
      //? HAProxy Proxy
      case GrpcProxyTlsEnums.GRPC:
        return `haproxy-proxy-secret-${nodeAlias}`;

      //? Envoy Proxy
      case GrpcProxyTlsEnums.GRPC_WEB:
        return `envoy-proxy-secret-${nodeAlias}`;
    }
  }

  /**
   * Creates the secret labels based on the node alias type
   *
   * @param nodeAlias - node alias
   * @param type - whether is for gRPC or gRPC Web ( Haproxy or Envoy )
   *
   * @returns the appropriate secret labels
   */
  static renderGrpcTlsCertificatesSecretLabelObject(nodeAlias: NodeAlias, type: GrpcProxyTlsEnums) {
    switch (type) {
      //? HAProxy Proxy
      case GrpcProxyTlsEnums.GRPC:
        return {'haproxy-proxy-secret': nodeAlias};

      //? Envoy Proxy
      case GrpcProxyTlsEnums.GRPC_WEB:
        return {'envoy-proxy-secret': nodeAlias};
    }
  }

  /**
   * Parsed and validates the unparsed value of flag clusterMappings
   *
   * @param unparsed - value of flag clusterMappings
   */
  public static parseContextCluster(unparsed: string): ContextClusterStructure {
    const mapping = {};
    const errorMessage =
      'Invalid context in context-cluster, expected structure where context' +
      ' is key = value is cluster and comma delimited if more than one, ' +
      '(e.g.: --context-cluster kind-solo=kind-solo,kind-solo-2=kind-solo-2)';

    unparsed.split(',').forEach(data => {
      const [context, cluster] = data.split('=') as [Context, Cluster];

      if (!context || typeof context !== 'string') {
        throw new SoloError(errorMessage, null, {data});
      }

      if (!cluster || typeof cluster !== 'string') {
        throw new SoloError(errorMessage, null, {data});
      }

      mapping[context] = cluster;
    });

    return mapping;
  }

  static parseClusterAliases(clusters: string) {
    return clusters ? clusters.split(',') : [];
  }

  public static renderEnvoyProxyName(nodeAlias: NodeAlias): string {
    return `envoy-proxy-${nodeAlias}`;
  }

  public static renderHaProxyName(nodeAlias: NodeAlias): string {
    return `haproxy-${nodeAlias}`;
  }

  public static parseNodeAliasToIpMapping(unparsed: string): Record<NodeAlias, IP> {
    const mapping: Record<NodeAlias, IP> = {};

    unparsed.split(',').forEach(data => {
      const [nodeAlias, ip] = data.split('=') as [NodeAlias, IP];
      mapping[nodeAlias] = ip;
    });

    return mapping;
  }
}
