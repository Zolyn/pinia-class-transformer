import { expect } from 'chai';
import { Store, createOptions } from '../src';

@Store
class TestClass {
    public a = '1';

    public get b(): number {
        return Math.random();
    }

    public c(): void {
        console.log(3);
    }
}

const options = createOptions('TestClass', TestClass);
const store = options as Required<typeof options>;

describe('Options test', function () {
    describe('State', function () {
        it("has only one property 'a'", function () {
            expect(store.state(), "has 'a'").to.have.keys('a');
        });
    });
    describe('Getter', function () {
        it("has only one property 'b'", function () {
            expect(store.getters, "has 'b'").to.have.keys('b');
        });
    });
    describe('Action', function () {
        it("has only one property 'c'", function () {
            expect(store.actions, "has 'c'").to.have.keys('c');
        });
    });
});
