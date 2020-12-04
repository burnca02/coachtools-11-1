// Hides all the subs in CoachHome
function hideSubs() {
    var pos = ["sQB", "sRB", "sWR", "sOL","sTE",'sDE','sDL','sDT','sCB','sOLB','sMLB','sSS','sFS','sSPE']; //,"LT","LG","C", "RG","RT","TE","CB","DE","DT","OLB","MLB","SS","FS"];
    for (i = 0; i < pos.length; i++) {
      var hideDiv = document.getElementById(pos[i]);
      hideDiv.style.display = "none";
      // alert('hiding' + pos[i])
    }
  }
// Shows a certain sub box in CoachHome
function showSubs(sub) {
  hideSubs();
  var showDiv = document.getElementById(sub);
  showDiv.style.display = "block";
}
// Resizes the dropdown when making player pages mobile friendly
function resizeDropdown2() {
  var x = document.getElementById("mySidenav");
  if (x.className === "sidenav") {
    x.className += " responsive";
  } else {
    x.className = "sidenav";
  }
}
// Toggles active team shown on CoachHome
function toggleActiveTeam(t) {
  hideSubs();
  var off = document.getElementById("offenseLine");
  var def = document.getElementById("defenseLine");
  var spe = document.getElementById("specialLine");
  if (t == 'o') {
    off.style.display = "block";
    def.style.display = "none";
    spe.style.display = "none";
  }
  else if (t == 'd') {
    off.style.display = "none";
    def.style.display = "block";
    spe.style.display = "none";
  }
  else {
    off.style.display = "none";
    def.style.display = "none";
    spe.style.display = "block";
  }
}