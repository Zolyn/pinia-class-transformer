import { expect } from 'chai';
import { Store, createOptions } from '../src/old';

class Parent {
    public d = '2';

    public get e(): number {
        return Math.random();
    }

    public c(): string {
        return 'hi';
    }
    public f(): void {
        console.log(4);
    }
}

@Store
class Child extends Parent {
    public a = '1';

    public get b(): number {
        return Math.random() * 10;
    }

    public c(): string {
        return 'hello';
    }
}

console.log(Object.getPrototypeOf(Child));
const options = createOptions('Child', Child);
const store = options as Required<typeof options>;
console.log(store);
describe('Extends test', function () {
    describe('State', function () {
        it(`has property 'd'`, function () {
            expect(store.state(), `has 'd'`).to.have.property('d');
        });
    });
    describe('Getter', function () {
        it(`has property 'e'`, function () {
            expect(store.getters, `has 'e'`).to.have.property('e');
        });
    });
    describe('Action', function () {
        it(`has property 'f'`, function () {
            expect(store.actions, `has 'f'`).to.have.property('f');
        });
        it(`expect action 'c' to return 'hello'`, function () {
            expect(store.actions.c(), `equal 'hello'`).to.equal('hello');
        });
    });
});
