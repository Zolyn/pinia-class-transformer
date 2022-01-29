import { mergeObjectArray } from '../src/old';
import { expect } from 'chai';

const arr = [
    {
        a: {
            value: 1,
        },
        b: 4,
    },
    {
        a: {
            value: 2,
        },
    },
    {
        b: 3,
    },
];

const result = mergeObjectArray(arr);
console.log(result);
describe('Utils test', function () {
    describe('mergeObjectArray', function () {
        it(`expect 'a' to euqal 2`, function () {
            expect(result.a, 'a = 2').to.have.property('value').and.equal(2);
        });
        it(`expect 'b' to equal 3`, function () {
            expect(result.b, 'b = 3').to.equal(3);
        });
    });
});
