/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any */
import { expect } from "chai";
import * as sinon from "sinon";
import { html, render } from "..";

describe("render", () => {
  let container!: HTMLDivElement;

  function test(tmpl: unknown, innerHTML: string) {
    render(tmpl, container);
    expect(container.innerHTML.replace(/<!---->/g, "")).to.equal(
      innerHTML,
      "render"
    );
  }

  beforeEach(() => {
    container = document.body.appendChild(document.createElement("div"));
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("simple", () => {
    const app = html`
      <div>Hello</div>
    `;
    test(app, `<div>Hello</div>`);
  });

  it("slash elements", () => {
    const app = html`
      <div />
    `;
    test(app, "<div></div>");
  });

  it("void elements", () => {
    // prettier-ignore
    const app = html`
      <input><input /><INPUT>
    `;

    test(app, "<input><input><input>");
  });

  it("empty", () => {
    test(html``, "");
  });

  it("text", () => {
    const app = html`
      <div>Hello, ${"world"}</div>
      <div>number, ${100}</div>
      <div>true, ${true}</div>
      <div>false, ${false}</div>
    `;
    test(
      app,
      "<div>Hello, world</div>" +
        "<div>number, 100</div>" +
        "<div>true, true</div>" +
        "<div>false, false</div>"
    );
  });

  it("attributes", () => {
    const app = html`
      <div
        name="World"
        value=${"value"}
        data-num=${2}
        data-true=${true}
        data-false=${false}
        data-zero=${0}
        data-NaN=${NaN}
        data-null=${null}
        data-undefined=${undefined}
        key=${1}
      ></div>
    `;
    test(
      app,
      "<div" +
        ' name="World"' +
        ' value="value"' +
        ' data-num="2"' +
        ' data-true="true"' +
        ' data-false="false"' +
        ' data-zero="0"' +
        ' data-nan="NaN"' +
        "></div>"
    );
  });

  it("ref function attribute", () => {
    let refNode!: HTMLDivElement;
    const app = html`
      <div ref=${(node: HTMLDivElement) => (refNode = node)}></div>
    `;
    render(app, container);
    expect(container.querySelector("div")).to.equal(refNode);
  });

  it("ref object attribute", () => {
    const ref = { current: null };
    const app = html`
      <div ref=${ref}></div>
    `;
    render(app, container);
    expect(container.querySelector("div")).to.equal(ref.current);
  });

  it("spread attribute", () => {
    const cb = sinon.spy();
    const props = { a: 1, "?b": 2, ".c": 3, "@d": cb };
    const app = html`
      <div ...${props}></div>
    `;
    test(app, '<div a="1" b=""></div>');
  });

  it("boolean attribute", () => {
    const app = html`
      <div ?yes=${true} ?no=${false}>Hello</div>
    `;
    test(app, `<div yes="">Hello</div>`);
  });

  it("property ", () => {
    const value = { name: "world" };
    const app = html`
      <div .value=${value}>Hello</div>
    `;
    test(app, `<div>Hello</div>`);
    expect((container.querySelector("div")! as any).value).to.equal(value);
  });

  it("evnet handler", () => {
    const cb = sinon.spy();
    const app = html`
      <button @click=${cb}>click</button>
    `;
    test(app, `<button>click</button>`);
    container.querySelector("button")!.click();
    expect(cb.calledOnce).to.be.true;
  });

  it("array", () => {
    const app = html`
      <div>${["a", "b", "c"]}</div>
    `;
    test(app, `<div>abc</div>`);
  });

  it("template", () => {
    const app = html`
      <div>
        ${["a", "b", "c"].map(
          s =>
            html`
              <input value=${s} />
            `
        )}
      </div>
    `;
    test(
      app,
      "<div>" +
        '<input value="a">' +
        '<input value="b">' +
        '<input value="c">' +
        "</div>"
    );
  });

  it("falsy values", () => {
    const app = html`
      <div>0, ${0}</div>
      <div>NaN, ${NaN}</div>
      <div>null, ${null}</div>
      <div>undefined, ${undefined}</div>
    `;
    test(
      app,
      "<div>0, 0</div>" +
        "<div>NaN, NaN</div>" +
        "<div>null, </div>" +
        "<div>undefined, </div>"
    );
  });

  it("raw string", () => {
    test("string", `string`);
  });

  it("raw number", () => {
    test(100, `100`);
  });

  it("raw boolean", () => {
    test(false, `false`);
  });

  it("raw array", () => {
    test(["a", "b", "c"], `abc`);
  });

  it("raw null", () => {
    test(null, ``);
  });

  it("raw undefined", () => {
    test(undefined, ``);
  });

  it("escaped value in template", () => {
    // prettier-ignore
    const app = html`
      <div>\n</div>
      <div>\2</div>
    `;
    test(app, "<div>\\n</div><div>\\2</div>");
  });

  it("unsafe html", () => {
    const app = html`
      <div unsafe-html=${"<p>unsafe</p>"}>
        ignored
      </div>
    `;

    test(app, "<div><p>unsafe</p></div>");
  });
});