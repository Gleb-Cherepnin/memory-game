import { el } from "./dom.js";

let current = null;

function onKeydown(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}

function setBackgroundInert(value) {
  const app = document.querySelector(".app");

  if (!app) {
    return;
  }

  if (value) {
    app.setAttribute("inert", "");
  } else {
    app.removeAttribute("inert");
  }
}

/**
 * @param {{
 *   title: string,
 *   content: Node,
 *   actions: {label: string, onClick: () => void}[]
 * }} options
 */
export function openModal({ title, content, actions }) {
  closeModal();

  const previousFocus = document.activeElement;

  const actionButtons = actions.map((action) => {
    return el("button", {
      className: "btn",
      text: action.label,
      attrs: {
        type: "button",
      },
      on: {
        click: action.onClick,
      },
    });
  });

  const buttons = el(
    "div",
    { className: "modal__actions" },
    ...actionButtons,
  );

  const titleElement = el("h2", {
    className: "modal__title",
    text: title,
    attrs: {
      id: "modal-title",
    },
  });

  const body = el(
    "div",
    { className: "modal__body" },
    content,
  );

  const dialog = el(
    "div",
    {
      className: "modal",
      attrs: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "modal-title",
        tabindex: "-1",
      },
    },
    titleElement,
    body,
    buttons,
  );

  const overlay = el(
    "div",
    {
      className: "overlay",
      on: {
        click: (event) => {
          if (event.target === overlay) {
            closeModal();
          }
        },
      },
    },
    dialog,
  );

  document.body.append(overlay);
  document.body.classList.add("modal-open");

  setBackgroundInert(true);

  document.addEventListener("keydown", onKeydown);

  dialog.focus();

  current = {
    overlay,
    previousFocus,
  };
}

export function closeModal() {
  if (!current) {
    return;
  }

  const { overlay, previousFocus } = current;

  current = null;

  overlay.remove();
  document.body.classList.remove("modal-open");

  setBackgroundInert(false);

  document.removeEventListener("keydown", onKeydown);

  if (previousFocus && document.contains(previousFocus)) {
    previousFocus.focus();
  }
}