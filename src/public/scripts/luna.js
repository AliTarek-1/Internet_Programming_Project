$(document).ready(function () {
  $(".left-nav-toggle a").on("click", function (event) {
    event.preventDefault();
    $("body").toggleClass("nav-toggle");
  });

  $(".nav-second").on("show.bs.collapse", function () {
    $(".nav-second.in").collapse("hide");
  });

  $(".panel-toggle").on("click", function (event) {
    event.preventDefault();
    var hpanel = $(event.target).closest("div.panel");
    var icon = $(event.target).closest("i");
    var body = hpanel.find("div.panel-body");
    var footer = hpanel.find("div.panel-footer");

    body.slideToggle(300);
    footer.slideToggle(200);

    icon.toggleClass("fa-chevron-up").toggleClass("fa-chevron-down");
    hpanel.toggleClass("").toggleClass("panel-collapse");

    setTimeout(function () {
      hpanel.resize();
      hpanel.find("[id^=map-]").resize();
    }, 50);
  });

  $(".panel-close").on("click", function (event) {
    event.preventDefault();
    var hpanel = $(event.target).closest("div.panel");
    hpanel.remove();
  });
});
