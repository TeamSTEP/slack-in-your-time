// this is just a simple test starter for jest

function addNumber(a: number, b: number) {
    return a + b;
}

describe('math', () => {
    it('should return a value that is the sum of two parameters', async () => {
        const response = addNumber(2, 6);
        expect(response).toEqual(8);
    });
});
