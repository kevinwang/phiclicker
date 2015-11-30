/**
 * Source: https://gist.github.com/xymostech/44d9c92207fa2d1431f6
 */
module.exports = function(elem) {
    var displayMaths = elem.textContent.split("$$");

    elem.innerHTML = "";

    var isDisplay = false;
    for (var i = 0; i < displayMaths.length; i++) {
        var displayMath = displayMaths[i];
        if (isDisplay) {
            var display = document.createElement("span");
            var wrap = document.createElement("div");

            wrap.className = "katex-display";
            wrap.appendChild(display);

            try {
                katex.render("\\displaystyle " + displayMath, display);
                elem.appendChild(wrap);
            } catch(e) {
                elem.appendChild(
                    document.createTextNode("$$" + displayMath + "$$"));
                    console.error("In " + displayMath, e.message);
            }
        } else {
            var inlineMaths = displayMath.split("$");

            var isInline = false;
            for (var j = 0; j < inlineMaths.length; j++) {
                var inlineMath = inlineMaths[j];
                if (isInline) {
                    var span = document.createElement("span");

                    try {
                        katex.render(inlineMath, span);
                        elem.appendChild(span);
                    } catch(e) {
                        elem.appendChild(
                            document.createTextNode("$" + inlineMath + "$"));
                            console.error("In " + inlineMath, e.message);
                    }
                } else {
                    elem.appendChild(
                        document.createTextNode(inlineMath));
                }
                isInline = !isInline;
            }
        }
        isDisplay = !isDisplay;
    }
}
