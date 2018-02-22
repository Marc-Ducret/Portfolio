const COLOR_SCHEME = 'blue';

function generate_project_card(info) {
    let elem = document.createElement('div');
    elem.setAttribute('class', 'col s12 m6 l4');
    elem.innerHTML =
        '<div class="card sticky-action hoverable">\n' +
        '    <div class="card-image waves-effect waves-block waves-light">\n' +
        '        <img class="activator" src="content/images/' + info.image + '">\n' +
        '    </div>\n' +
        '    <div class="card-content">\n' +
        '        <span class="card-title activator grey-text text-darken-4">'
        + info.name + '<i class="material-icons right">more_vert</i>' +
        '        </span>\n' +
        '    </div>\n' +
        '    <div class="card-reveal">\n' +
        '        <span class="card-title grey-text text-darken-4">'
        + info.name + '<i class="material-icons right">close</i>' +
        '        </span>\n' +
        '        <p>' + info.details + '</p>\n' +
        '    </div>\n' +
        '\n' +
        '    <div class="card-action">\n' +
        '        <a class="'+COLOR_SCHEME+'-text" href="?content=project&project=' + info.id + '">Project Page</a>\n' +
        '    </div>\n' +
        '</div>';
    return elem;
}

function generate_text_page_block(content) {
    let div = document.createElement('div');
    switch (content.type) {
        case 'text':
            if (content.title) {
                let title = document.createElement(content.text ? 'h3' : 'h1');
                title.innerHTML = content.title;
                title.setAttribute('class', content.text ?
                    COLOR_SCHEME + '-text text-darken-4' :
                    COLOR_SCHEME + '-text text-darken-4 center');
                div.appendChild(title);
            }
            if (content.text) {
                let text = document.createElement('p');
                text.innerHTML = content.text;
                text.style.textAlign = 'justify';
                div.appendChild(text);
            }
            break;

        case 'image':
            div.style.marginTop = '5px';
            let row = document.createElement('div');
            row.setAttribute('class', 'row');
            row.style.margin = '0px';
            let srcs = content.src.split(';');
            let width = 100 / srcs.length + '%';
            for(let src of srcs) {
                src = src.trim();
                let img = document.createElement('img');
                let container = document.createElement('div');
                let preloader = document.createElement('div');
                preloader.setAttribute('class', 'preloader-wrapper big active');
                preloader.innerHTML =
                    '<div class="spinner-layer spinner-blue-only">\n' +
                    '    <div class="circle-clipper left">\n' +
                    '        <div class="circle"></div>\n' +
                    '    </div><div class="gap-patch">\n' +
                    '        <div class="circle"></div>\n' +
                    '    </div><div class="circle-clipper right">\n' +
                    '        <div class="circle"></div>\n' +
                    '    </div>\n' +
                    '</div>';
                img.setAttribute('src', 'content/images/' + src);
                img.style.display = 'block';
                img.onload = function(ev) {
                    container.removeChild(preloader);
                    img.style.display = 'block';
                };
                container.setAttribute('class', 'col');
                container.style.width = width;
                img.setAttribute('class', 'materialboxed');
                img.style.width = '100%';
                container.appendChild(img);
                container.appendChild(preloader);
                row.appendChild(container);
            }
            div.appendChild(row);
            if (content.caption) {
                let caption = document.createElement('h5');
                caption.setAttribute('class', COLOR_SCHEME + '-text text-lighten-4 center');
                caption.style.marginBottom = '20px';
                caption.style.marginTop = '3px';
                caption.innerHTML = content.caption;
                div.appendChild(caption);
            }
            break;
    }
    return div;
}

function generate_text_page(contents) {
    let container = document.createElement('div');
    let margin_left = document.createElement('div');
    margin_left.setAttribute('class', 'col s0 xl3');
    let margin_right = document.createElement('div');
    margin_right.setAttribute('class', 'col s0 xl3');
    let div = document.createElement('div');
    div.setAttribute('class', 'col s12 xl6');
    for (let content of contents) {
        div.appendChild(generate_text_page_block(content));
    }
    container.appendChild(margin_left);
    container.appendChild(div);
    container.appendChild(margin_right);
    return container;
}

function load_content() {
    let content_node = document.getElementById('content');
    let appendContent = function (elem) {
        content_node.appendChild(elem);
        materialize_init();
    };
    let params = new URL(document.location.href).searchParams;
    let content_type = params.get('content');
    if (!content_type) {
        content_type = 'text_page';
        params.set('content', content_type);
        params.set('page', 'home');
    }
    console.log('loading ' + content_type);
    switch (content_type) {
        case 'projects':
            load_object('content/projects/list', function (list) {
                let urls = [];
                for (let l of list) {
                    urls.push('content/projects/' + l);
                }
                load_objects(urls, function (projects) {
                    for (let proj of projects) {
                        appendContent(generate_project_card(proj));
                    }
                });
            });
            break;

        case 'project':
            load_object('content/projects/' + params.get('project'), function (proj) {
                appendContent(generate_text_page(proj.page));
            });
            break;

        case 'text_page':
            load_object('content/' + params.get('page'), function (contents) {
                appendContent(generate_text_page(contents));
            });
            break;
    }
}

function load_object(url, onload) {
    let req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function () {
        let json = req.responseText.replace(/[\n\r]/g, ' ').replace(/@COLOR_SCHEME@/g, COLOR_SCHEME);
        //TODO more general RegExp (replace @VAR@ with eval(VAR))
        onload(JSON.parse(json));
    };
    req.send();
}

function load_objects(urls, onload) {
    let ct = 0;
    let objects = [];
    for (let i in urls) {
        load_object(urls[i], function (obj) {
            objects[i] = obj;
            if (++ct === urls.length) {
                onload(objects);
            }
        });
    }
}

function init_color_scheme() {
    let elem = document.getElementById('nav');
    elem.setAttribute('class', elem.getAttribute('class') + ' ' + COLOR_SCHEME);
}

function materialize_init() {
    let sel = document.querySelectorAll('.materialboxed');
    if (sel) M.Materialbox.init(sel, {});
    sel = document.querySelectorAll('p a');
    for (let elem of sel) {
        elem.setAttribute('class', elem.getAttribute('class') + ' ' + COLOR_SCHEME + '-text');
    }
}

init_color_scheme();
load_content();
materialize_init();