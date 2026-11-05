/**
 * Fluid grid: places each item in the shortest column, in DOM order.
 * Result reads left to right, top to bottom, with no empty gaps.
 *
 * Usage:
 *   <div data-fluid-grid data-gap="24" data-min-col="420" data-max-cols="2">
 *     <section>...</section>
 *     <div class="contents">  <!-- wrappers with display: contents are flattened -->
 *       <section>...</section>
 *     </div>
 *   </div>
 *
 * Items that are display: none are skipped. Layout re-runs when an item
 * resizes, when a descendant's class/style changes, or when the container resizes.
 */
(function () {
  "use strict";

  function setup($) {
    const DEFAULTS = {
      gap: 16,
      minCol: 320,
      maxCols: 2,
    };

    function collect($parent, items) {
      $parent.children().each(function () {
        const $el = $(this);
        const display = $el.css("display");

        if (display === "contents") {
          collect($el, items);
        } else if (display !== "none") {
          items.push($el);
        }
      });

      return items;
    }

    function init($container, options) {
      const opts = $.extend({}, DEFAULTS, options);
      const container = $container[0];
      const observed = new WeakSet();
      let frame = 0;

      function layout() {
        const width = $container.width();
        const cols = Math.max(
          1,
          Math.min(
            opts.maxCols,
            Math.floor((width + opts.gap) / (opts.minCol + opts.gap)),
          ),
        );
        const colWidth = (width - opts.gap * (cols - 1)) / cols;
        const heights = new Array(cols).fill(0);
        const items = collect($container, []);

        items.forEach(function ($item) {
          $item.css({ position: "absolute", width: colWidth });

          let col = 0;
          for (let i = 1; i < cols; i++) {
            if (heights[i] < heights[col]) col = i;
          }

          $item.css({ left: col * (colWidth + opts.gap), top: heights[col] });
          heights[col] += $item[0].offsetHeight + opts.gap;

          if (!observed.has($item[0])) {
            observed.add($item[0]);
            resizeObserver.observe($item[0]);
          }
        });

        $container.css({
          position: "relative",
          height: Math.max(0, Math.max.apply(null, heights) - opts.gap),
        });
      }

      function run() {
        frame = 0;
        mutationObserver.disconnect();
        layout();
        mutationObserver.observe(container, mutationConfig);
      }

      function schedule() {
        if (!frame) frame = requestAnimationFrame(run);
      }

      const mutationConfig = {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden"],
      };
      const mutationObserver = new MutationObserver(schedule);
      const resizeObserver = new ResizeObserver(schedule);

      resizeObserver.observe(container);
      run();
      $(window).on("load", schedule);
    }

    $.fn.fluidGrid = function (options) {
      return this.each(function () {
        const $el = $(this);
        if ($el.data("fluidGrid")) return;
        $el.data("fluidGrid", true);

        init(
          $el,
          $.extend(
            {},
            $el.data("gap") !== undefined && { gap: Number($el.data("gap")) },
            $el.data("minCol") !== undefined && { minCol: Number($el.data("minCol")) },
            $el.data("maxCols") !== undefined && { maxCols: Number($el.data("maxCols")) },
            options,
          ),
        );
      });
    };

    $(function () {
      $("[data-fluid-grid]").fluidGrid();
    });
  }

  function start() {
    if (typeof window.jQuery === "undefined") {
      setTimeout(start, 100);
      return;
    }

    setup(window.jQuery);
  }

  start();
})();
