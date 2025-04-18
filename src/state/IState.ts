/*-
 *
 * Hedera Local Node
 *
 * Copyright (C) 2023-2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { IOBserver } from '../controller/IObserver';

/**
 * Represents the state of an entity.
 */
export interface IState {
    /**
     * Called when the state is started.
     * @returns {Promise<void>} A promise that resolves when the state has started.
     */
    onStart(): Promise<void>;

    /**
     * Subscribes an observer to the state.
     * @param {IOBserver} observer - The observer to subscribe.
     */
    subscribe(observer: IOBserver): void;
}
