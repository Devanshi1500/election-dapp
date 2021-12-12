var Election = artifacts.require('./Election.sol');

contract("Election", (accounts) => {
  it("initializies with two candidates", () => {
    return Election.deployed().then((instance) => {
      return instance.candidatesCount();
    }).then((count) => {
      assert.equal(count, 2);
    });
  });
  it("initializes candidates with correct values", () => {
    return Election.deployed().then((instance) => {
      electionInstance = instance
      return electionInstance.candidates(1);
    }).then((candidate) => {
      assert.equal(candidate[0], 1, "contains the correct id");
      assert.equal(candidate[1], "Candidate 1", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct vote count");
      return electionInstance.candidates(2);
    }).then((candidate) => {
      assert.equal(candidate[0], 2, "contains the correct id");
      assert.equal(candidate[1], "Candidate 2", "contains the correct name");
      assert.equal(candidate[2], 0, "contains the correct vote count");
    });
  });
});