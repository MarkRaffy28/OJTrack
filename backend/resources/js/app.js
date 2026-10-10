
$(function () {
  // Select2 search
  $(".js-select2").each(function () {
    const $el = $(this);
    const isSearchable = $el.attr("data-searchable") === "true";

    $el.select2({
      width: "100%",
      placeholder: $el.data("placeholder") || "Select an option",
      allowClear: true,
      minimumResultsForSearch: isSearchable ? 0 : Infinity,
    });
  });

  // Password visibility
  $(document).on("click", "[data-password-toggle]", function () {
    const button = $(this);
    const input = button.siblings("input");
    const icon = button.find(".material-symbols-outlined");

    const isPassword = input.attr("type") === "password";

    input.attr("type", isPassword ? "text" : "password");
    icon.text(isPassword ? "visibility_off" : "visibility");
  });

  // Form submit loading
  $(document).on("submit", "form[data-loading-submit]", function (event) {
    const form = $(this);
    const button = form.find("[data-submit-button]");

    if (!button.length || button.prop("disabled")) {
      return;
    }

    const spinner = button.find("[data-submit-spinner]");
    const text = button.find("[data-submit-text]");
    const loadingText = button.data("loading-text");

    setTimeout(() => {
      button.prop("disabled", true);
      spinner.removeClass("hidden");
      text.text(loadingText);
    }, 0);
  });

  // Alert auto-hide
  $("[data-auto-hide]").each(function () {
    const alert = $(this);
    const duration = Number(alert.data("auto-hide")) || 5000;

    setTimeout(() => {
      alert.fadeOut(300, function () {
        $(this).remove();
      });
    }, duration);
  });

  // Role field toggling
  const roleInput = $('[name="role"]');

  function updateRoleFields() {
    const role = roleInput.val();

    $("[data-role-fields]").each(function () {
      const fields = $(this);
      const matches = fields.data("role-fields") === role;

      fields.toggle(matches);
      fields.find("input, select, textarea").prop("disabled", !matches);
    });
  }

  roleInput.on("change", updateRoleFields);

  updateRoleFields();

  // Modal
  $(document).on("click", "[data-dialog-open]", function () {
    const id = $(this).data("dialog-open");

    $("#" + id)
      .removeClass("hidden")
      .addClass("flex");
  });

  $(document).on("click", "[data-dialog-dismiss]", function () {
    $(this).closest("[data-dialog]").removeClass("flex").addClass("hidden");
  });

  $(document).on("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    $("[data-dialog]:visible").removeClass("flex").addClass("hidden");
  });

  // Modal Dismiss / Escape key
  $(document).on("click", "[data-dialog-dismiss]", function () {
    $(this).closest("[data-dialog]").removeClass("flex").addClass("hidden");
  });

  $(document).on("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    $("[data-dialog]:visible").removeClass("flex").addClass("hidden");
  });

  // Global Delete Modal Trigger Handler
  $(document).on("click", "[data-delete-trigger]", function () {
    const button = $(this);
    const action = button.data("action");
    const item = button.data("item") || "this item";
    const title = button.data("title") || "Confirm Delete";

    // Populate modal inputs/text dynamically
    $("#global-delete-form").attr("action", action);
    $("#global-delete-title").text(title);
    $("#global-delete-description").text(`Are you sure you want to delete ${item}?`);

    // Open the single modal instance
    $("#global-delete-dialog")
      .removeClass("hidden")
      .addClass("flex");
  });

  // Filter form: omit empty params from the URL
  $(document).on("submit", "form[data-filter-form]", function (event) {
    event.preventDefault();

    const form = $(this);
    const query = $.param(form.serializeArray().filter((field) => field.value.trim() !== ""));

    window.location.href = form.attr("action") + (query ? "?" + query : "");
  });

  // Table row links
  $(document).on("click", "[data-href]", function (event) {
    if ($(event.target).closest("a, button, [data-dialog-open], [data-delete-trigger]").length) {
      return;
    }
    window.location.href = $(this).data("href");
  });
});
