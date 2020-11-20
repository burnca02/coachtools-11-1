function hideSubs() {
    var pos = ["sQB", "sRB", "sWR"]; //,"LT","LG","C", "RG","RT","TE","CB","DE","DT","OLB","MLB","SS","FS"];
    for (i = 0; i < pos.length; i++) {
      var hideDiv = document.getElementById(pos[i]);
      hideDiv.style.display = "none";
    }
  }

  function showSubs(sub) {
    hideSubs();
    var showDiv = document.getElementById(sub);
    showDiv.style.display = "block";
  }
  
  function renameFunc(n) {
    var orig = document.getElementById(n).innerHTML;
    var person = prompt("Please enter your name:");
    if (person != "" && person != null) {
      document.getElementById(n).innerHTML = person;
    } else {
      document.getElementById(n).innerHTML = orig;
    }
  }
  function resizeDropdown2() {
    var x = document.getElementById("mySidenav");
    if (x.className === "sidenav") {
      x.className += " responsive";
    } else {
      x.className = "sidenav";
    }
  }