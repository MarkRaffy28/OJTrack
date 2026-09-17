
$(function () {
  // Select2 search
  $(".js-searchable-select").select2({
    width: "100%",
    placeholder: "Select an option",
    allowClear: true,
    minimumResultsForSearch: 0,
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
});
