/******************************************************************************/
var STORAGE_ENABLED = "screensaver_enabled";
var STORAGE_SELECTED = "screensaver_selected";

var OPTIONS = [
    {
        id: "kittens",
        label: "Котята (по умолчанию)",
        info: "Текущая заставка каталога · https://blv11.github.io/msx/kittens.mp4",
        url: "https://blv11.github.io/msx/kittens.mp4?v=3",
        image: "https://wals09.github.io/kf/img/bac.jpg"
    },
    {
        id: "1",
        label: "1. Спящие котята при лунном свете",
        info: "Pixabay 342209 · 1080x1920 (вертикальное) · 8 с · 2.8 МБ",
        url: "https://cdn.pixabay.com/video/2026/03/24/342209_large.mp4",
        image: "https://i.vimeocdn.com/video/342209.jpg"
    },
    {
        id: "3",
        label: "3. Спящий котёнок",
        info: "Pixabay 330346 · 4098x2160 · 24 с · 32 МБ",
        url: "https://cdn.pixabay.com/video/2026/01/25/330346_large.mp4",
        image: "https://i.vimeocdn.com/video/330346.jpg"
    },
    {
        id: "5",
        label: "5. Кот спит (AI)",
        info: "Pixabay 246351 · 3840x2160 · 25 с · 5.7 МБ",
        url: "https://cdn.pixabay.com/video/2024/12/12/246351_large.mp4",
        image: "https://i.vimeocdn.com/video/246351.jpg"
    },
    {
        id: "8",
        label: "8. Котёнок на жёлтом фоне",
        info: "Pexels 7120008 · 1920x1080 · яркий фон",
        url: "https://videos.pexels.com/video-files/7120008/7120008-hd_1920_1080_25fps.mp4",
        image: "https://images.pexels.com/videos/7120008/pictures/preview-0.jpg"
    }
];

var DEFAULT_SELECTED = "kittens";
var SWITCH_ON = "msx-white:toggle-on";
var SWITCH_OFF = "msx-white-soft:toggle-off";
var RADIO_ON = "msx-white:radio-button-checked";
var RADIO_OFF = "msx-white-soft:radio-button-unchecked";

function getOptionById(id) {
    for (var i = 0; i < OPTIONS.length; i++) {
        if (OPTIONS[i].id == id) return OPTIONS[i];
    }
    return getOptionById(DEFAULT_SELECTED);
}

function getEnabled() {
    if (typeof TVXServices !== "undefined" && TVXServices.storage) {
        return TVXServices.storage.getBool(STORAGE_ENABLED, true);
    }
    return true;
}

function getSelected() {
    if (typeof TVXServices !== "undefined" && TVXServices.storage) {
        var v = TVXServices.storage.getFullStr(STORAGE_SELECTED, DEFAULT_SELECTED);
        return getOptionById(v).id;
    }
    return DEFAULT_SELECTED;
}

function saveSettings(enabled, selected) {
    if (typeof TVXServices !== "undefined" && TVXServices.storage) {
        TVXServices.storage.set(STORAGE_ENABLED, enabled);
        TVXServices.storage.set(STORAGE_SELECTED, selected);
        if (typeof TVXServices.storage.commit == "function") TVXServices.storage.commit();
    }
}

function applyScreensaver() {
    var enabled = getEnabled();
    var selected = getSelected();
    if (!enabled) {
        try { TVXInteractionPlugin.executeAction("player:stop"); } catch (e1) {}
        try { TVXInteractionPlugin.executeAction("player:video:stop"); } catch (e2) {}
        return;
    }
    var opt = getOptionById(selected);
    TVXInteractionPlugin.executeAction("execute:service:video:data:http://msx.benzac.de/services/background.php", {
        url: opt.url,
        label: opt.label,
        transparent: true
    });
}

function previewOption(id) {
    var opt = getOptionById(id);
    TVXInteractionPlugin.executeAction("video:" + opt.url);
}

// buildChooserItems() returns the selectable list with preview/select in panel:data.

function buildChooserItems() {
    var selected = getSelected();
    var items = [];
    for (var i = 0; i < OPTIONS.length; i++) {
        var opt = OPTIONS[i];
        var isSel = opt.id == selected;
        items.push({
            id: "opt_" + opt.id,
            type: "control",
            icon: "movie",
            label: opt.label,
            extensionLabel: opt.info,
            extensionIcon: isSel ? RADIO_ON : RADIO_OFF,
            action: "panel:data",
            data: {
                headline: opt.label,
                template: { enumerate: false, layout: "0,0,8,1" },
                items: [
                    {
                        type: "button",
                        icon: "play-arrow",
                        label: "Просмотр",
                        action: "interaction:commit",
                        data: { action: "preview:" + opt.id }
                    },
                    {
                        type: "button",
                        icon: isSel ? "check-circle" : "radio-button-unchecked",
                        label: isSel ? "Выбрано" : "Выбрать эту заставку",
                        action: "interaction:commit",
                        data: { action: "select:" + opt.id }
                    }
                ]
            }
        });
    }
    return items;
}

function buildSettings() {
    var enabled = getEnabled();
    var selected = getSelected();
    var opt = getOptionById(selected);
    return {
        cache: false,
        reuse: false,
        restore: false,
        type: "pages",
        headline: "Настройки",
        pages: [
            {
                headline: "Заставка",
                items: [
                    {
                        id: "toggle_enabled",
                        type: "control",
                        layout: "0,0,12,1",
                        icon: "wallpaper",
                        label: "Вкл/выкл заставки",
                        extensionLabel: enabled ? "Включена" : "Выключена",
                        extensionIcon: enabled ? SWITCH_ON : SWITCH_OFF,
                        action: "interaction:commit",
                        data: { action: "toggle" }
                    },
                    {
                        id: "choose",
                        type: "control",
                        layout: "0,1,12,1",
                        icon: "video-library",
                        label: "Выбор заставки",
                        extensionLabel: opt.label,
                        extensionIcon: "chevron-right",
                        action: "content:request:interaction:chooser@https://blv11.github.io/msx/screensaver-settings.html"
                    },
                    {
                        type: "default",
                        layout: "0,2,12,3",
                        color: "msx-glass",
                        titleHeader: "",
                        titleFooter: "",
                        text: "{col:msx-white}Текущая:{col} " + opt.label + "{br}{col:msx-white-soft}" + opt.info + "{br}{br}Доступны варианты 1, 3, 5, 8 (и Котята по умолчанию). Откройте «Выбор заставки», выберите вариант и нажмите «Просмотр»."
                    }
                ]
            }
        ]
    };
}

function buildChooserContent() {
    return {
        cache: false,
        reuse: false,
        restore: false,
        type: "list",
        headline: "Выбор заставки",
        template: {
            type: "control",
            layout: "0,0,12,1",
            area: "0,0,12,6",
            enumerate: false
        },
        items: buildChooserItems()
    };
}

/******************************************************************************/
function ScreensaverSettingsHandler() {
    var self = this;
    var readyApplied = false;

    function doApply() {
        try { applyScreensaver(); } catch (e) {
            try { TVXInteractionPlugin.error("Apply failed: " + e); } catch (e2) {}
        }
    }

    this.init = function() {};
    this.ready = function() {
        if (!readyApplied) {
            readyApplied = true;
            doApply();
        }
    };
    this.handleEvent = function(data) {
        if (data && data.event == "app:ready" && !readyApplied) {
            readyApplied = true;
            doApply();
        }
    };
    this.handleData = function(data) {
        if (!data || !data.data) return;
        var action = data.data.action || "";
        if (action == "toggle") {
            var enabled = !getEnabled();
            saveSettings(enabled, getSelected());
            doApply();
            TVXInteractionPlugin.executeAction("reload:content");
        } else if (action.indexOf("select:") == 0) {
            var id = action.substr(7);
            saveSettings(getEnabled(), getOptionById(id).id);
            doApply();
            TVXInteractionPlugin.executeAction("[reload:content|back]");
        } else if (action.indexOf("preview:") == 0) {
            previewOption(action.substr(8));
        } else if (action == "apply") {
            readyApplied = true;
            doApply();
        }
    };
    this.handleRequest = function(dataId, data, callback) {
        try {
            if (dataId == "init") {
                callback(buildSettings());
                setTimeout(function() {
                    doApply();
                }, 0);
            } else if (dataId == "chooser") {
                callback(buildChooserContent());
                setTimeout(function() {
                    doApply();
                }, 0);
            } else {
                callback(buildSettings());
                setTimeout(function() {
                    doApply();
                }, 0);
            }
        } catch (e) {
            try { callback(buildSettings()); } catch (e2) { callback(); }
        }
    };
}

TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new ScreensaverSettingsHandler());
    TVXInteractionPlugin.init();
});
