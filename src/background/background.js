chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateBadge(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
        updateBadge(activeInfo.tabId, tab.url);
    }
});

// --- Centralized matching logic ---

function matchUrl(url, env) {
    try {
        if (env.urlPattern.startsWith('/') && env.urlPattern.endsWith('/')) {
            const regex = new RegExp(env.urlPattern.slice(1, -1));
            return regex.test(url);
        }
        return url.includes(env.urlPattern);
    } catch (e) {
        console.error("Where Am I: Invalid regex", env.urlPattern);
        return false;
    }
}

async function matchCookie(url, env) {
    if (!env.cookieName) return true;

    try {
        const cookie = await chrome.cookies.get({ url, name: env.cookieName });
        if (!cookie) return false;
        if (env.cookieValue) return cookie.value === env.cookieValue;
        return true;
    } catch (e) {
        console.error("Where Am I: Error reading cookie", e);
        return false;
    }
}

async function findMatchingEnv(url) {
    const data = await chrome.storage.sync.get('environments');
    const environments = data.environments || [];

    for (const env of environments) {
        if (matchUrl(url, env) && await matchCookie(url, env)) {
            return env;
        }
    }
    return null;
}

// --- Badge update ---

async function updateBadge(tabId, url) {
    if (!url) return;

    chrome.action.setBadgeText({ text: "", tabId });

    if (url.startsWith('chrome://') || url.startsWith('edge://')) return;

    const { extensionEnabled } = await chrome.storage.sync.get({ extensionEnabled: true });
    if (!extensionEnabled) return;

    const match = await findMatchingEnv(url);

    if (match) {
        chrome.action.setBadgeBackgroundColor({ color: match.color, tabId });
    }
}

// --- React to toggle changes ---

chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync' && changes.extensionEnabled) {
        const enabled = changes.extensionEnabled.newValue;
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.id) {
                if (enabled && tab.url) {
                    updateBadge(tab.id, tab.url);
                } else {
                    chrome.action.setBadgeText({ text: "", tabId: tab.id });
                }
            }
        }
    }
});

// --- Message handler for content.js and popup.js ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'findMatchingEnv') {
        findMatchingEnv(message.url).then(env => {
            sendResponse(env);
        });
        return true; // keep channel open for async response
    }
});
