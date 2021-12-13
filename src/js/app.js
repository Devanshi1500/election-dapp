App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    //Modern dapp browsers
    if(window.ethereum) {
      App.web3Provider = window.ethereum;
      console.log("web3Provider = ", App);
      try {
        //Request account access
        // await window.ethereum.enable();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = accounts[0];
        $("#accountAddress").html("Your Account: " + accounts[0]);

      } catch (error) {
        // user denied access
        console.error("user denied account access");
      }
    }

    // Legacy dapp browsers....
    else if(window.web3) {
      App.web3Provider = window.web3.currentProvider;
      console.log("web3ProviderLegacy = ", window.web3.currentProvider);
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      console.log("web3provider Ganache", App.web3Provider);
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Set the provider for our contract
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: async function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          var castVoteBtn = `
            <form class="cast-vote" onSubmit="App.castVote(${id}); return false;">
              <button type="submit" class="btn btn-primary">Vote</button>
              <hr />
            </form>
          `

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td><td>" + castVoteBtn + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          return electionInstance.voters(App.account);
        }).then(hasVoted => {
          if(hasVoted) $('.cast-vote').hide();
          loader.hide();
          content.show();
        }).catch(err => console.error(err));
      }
    })
  },

  castVote: function(candidateId) {
    App.contracts.Election.deployed().then(instance => {
      electionInstance = instance;
      return electionInstance.vote(candidateId, { from: App.account });
    }).then(() => {
      content.hide();
      loader.show();
    }).catch(err => console.error(err))
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
