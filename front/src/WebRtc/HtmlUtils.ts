export class HtmlUtils {
    public static getElementByIdOrFail<T extends HTMLElement>(id: string): T {
        const elem = document.getElementById(id);
        if (elem === null) {
            throw new Error("Cannot find HTML element with id '"+id+"'");
        }
        // FIXME: does not check the type of the returned type
        return elem as T;
    }

    public static querySelectorOrFail<T extends HTMLElement>(selector: string): T {
        const elem = document.querySelector(selector);
        if (elem === null) {
            throw new Error("Cannot find HTML element with selector '"+selector+"'");
        }
        // FIXME: does not check the type of the returned type
        return elem as T;
    }

    public static removeElementByIdOrFail<T extends HTMLElement>(id: string): T {
        const elem = document.getElementById(id);
        if (elem === null) {
            throw new Error("Cannot find HTML element with id '"+id+"'");
        }
        // FIXME: does not check the type of the returned type
        elem.remove();
        return elem as T;
    }

    private static escapeHtml(html: string): string {
        const text = document.createTextNode(html);
        const p = document.createElement('p');
        p.appendChild(text);
        return p.innerHTML;
    }

    public static urlify(text: string): string {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = HtmlUtils.escapeHtml(text);
        return text.replace(urlRegex, (url: string) => {
            return '<a href="' + url + '" target="_blank" style=":visited {color: white}">' + url + '</a>';
        })
    }
}
