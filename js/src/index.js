import eve from 'dom-events';
import scrollToElement from 'scroll-to-element';
import App from './app';

const app = new App();
app.init();

eve.on(document.querySelector('.labs'), 'click', () => {
  scrollToElement(document.querySelector('section[id="labs"]'), {
    duration: 1000,
    ease: 'in-out-quint',
  });
});

