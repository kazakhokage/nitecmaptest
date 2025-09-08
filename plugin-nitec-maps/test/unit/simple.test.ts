describe('Simple Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test basic functionality', () => {
    const data = { lat: 40.7128, lon: -74.0060 };
    expect(data.lat).toBe(40.7128);
    expect(data.lon).toBe(-74.0060);
  });
});