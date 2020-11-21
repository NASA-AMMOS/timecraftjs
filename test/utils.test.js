const { arrayIndexOf } = require('../cjs/utils.js');
describe('arrayIndexOf', () => {
    it('should fail if the target is larger than the source.', () => {
        expect(arrayIndexOf([1,1,1], [1,1,1,1])).toEqual(-1);
    });

    it('should return the correct index.', () => {
        expect(arrayIndexOf([1,1,1], [1,1])).toEqual(0);
        expect(arrayIndexOf([2,1,1,1], [1,1])).toEqual(1);
        expect(arrayIndexOf([1,1,1,4,1], [1,4])).toEqual(2);
    });
});
