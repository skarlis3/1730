/* Draws the dotted path on the final project example page.
   The path runs through the centre of each .path-item in page order,
   so moving a piece in the HTML moves the path with it. Redrawn on
   resize and once the fonts have loaded, since both change where the
   pieces sit. Decorative only: the SVG is aria-hidden. */
(function () {
  var boards = document.querySelectorAll("[data-path-board]");
  Array.prototype.forEach.call(boards, function (board) {
    var line = board.querySelector("[data-path-line]");
    if (!line) return;
    function draw() {
      var b = board.getBoundingClientRect();
      line.ownerSVGElement.setAttribute("viewBox", "0 0 " + b.width + " " + b.height);
      var pts = Array.prototype.map.call(board.querySelectorAll(".path-item"), function (el) {
        var r = el.getBoundingClientRect();
        return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2];
      });
      if (pts.length < 2) return;
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        d += " C" + (p1[0] + (p2[0] - p0[0]) / 6) + " " + (p1[1] + (p2[1] - p0[1]) / 6) + " " +
             (p2[0] - (p3[0] - p1[0]) / 6) + " " + (p2[1] - (p3[1] - p1[1]) / 6) + " " +
             p2[0] + " " + p2[1];
      }
      line.setAttribute("d", d);
    }
    draw();
    window.addEventListener("resize", draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  });
})();
