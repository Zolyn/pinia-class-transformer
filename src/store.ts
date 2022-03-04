import { Actions, TransformResult } from './types';

/**
 * Store类
 *
 * @public
 */
class Store<S extends object> {
    protected wrappedStore!: TransformResult<S, Actions<S>>;
}

export { Store };
