import { useEffect, useRef } from "react";
import Icon from "./Icon";
export default function Modal({ children, onClose, title = 'Vault workspace dialog' }) {
  const dialog = useRef(null);
  function containTab(event) {
    if (event.key !== 'Tab' || event.defaultPrevented) return;
    const element = dialog.current;
    const controls = [...element.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') &&
        !node.closest('[hidden], [inert]') && node.getClientRects().length > 0 &&
        getComputedStyle(node).visibility !== 'hidden');
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); element.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === element)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-label={title}
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={containTab}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        className="icon-button modal-close"
        type="button"
        onClick={onClose}
        aria-label="Close form"
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  );
}
