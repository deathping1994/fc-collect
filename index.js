// Minify using babel-minify https://jscompress.com/

function getCookie(cookieName) {
    const cookies = document.cookie.split(';'); // split the full cookie string by semicolon to get an array of cookie strings

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim(); // trim any whitespace around the cookie string
        const cookieParts = cookie.split('=');

        if (cookieParts[0] === cookieName) {
            return cookieParts[1];
        }
    }

    return undefined; // if the cookie isn't found, return null
}

function setCookie(cookieName, cookieValue, expirationDays) {
    const d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

async function generateSimpleFingerprint() {
    let fingerprintHash = '';

    try {
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            new Date().getTimezoneOffset()
        ].join(',');

        const msgUint8 = new TextEncoder().encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        fingerprintHash = hashArray.slice(0, 18).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.error('Error generating fingerprint:', e);
        return '';
    }
    console.log("fingerprintHash", fingerprintHash)

    return fingerprintHash;
}

function parseQueryString(queryString) {
    if (!queryString) {
        return {};
    }

    if (typeof queryString !== "string") {
        throw new TypeError("Argument must be a string");
    }

    const query = {};
    const pairs = queryString.slice(1).split("&");

    pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        const decodedKey = decodeURIComponent(key);
        const decodedValue = decodeURIComponent(value);

        if (!query[decodedKey]) {
            query[decodedKey] = decodedValue;
        } else {
            if (Array.isArray(query[decodedKey])) {
                query[decodedKey].push(decodedValue);
            } else {
                query[decodedKey] = [query[decodedKey], decodedValue];
            }
        }
    });

    return query;
}


async function pageViewTrack() {
    var clientTimeZone, visitorId, ip, utm;
    try {
        clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (err) {
        clientTimeZone = "Asia/Calcutta";
        console.log("TimeZone error", err);
    }

    if (getCookie("fctrack_visitor_id")) {
        visitorId = getCookie("fctrack_visitor_id");
    } else {
        visitorId = await generateSimpleFingerprint();
        setCookie("fctrack_visitor_id", visitorId, 7);
    }

    if (sessionStorage.getItem("fc_ip")) {
        ip = sessionStorage.getItem("fc_ip");
    } else {
        try {
            const res = await fetch("https://qc.brimo.in/ip");
            const data = await res.json();
            ip = data?.ip;
            sessionStorage.setItem("fc_ip", data?.ip);
        } catch (err) {
            console.log("err", err);
            ip = ""
        }
    }

    if (getCookie("fctrack")) {
        utm = getCookie("fctrack");
    } else {
        const queryValue = parseQueryString(window.location.search);
        if (
            queryValue?.utm_source ||
            queryValue?.utm_medium ||
            queryValue?.utm_campaign
        ) {
            utm = `us=${queryValue?.utm_source}; um=${queryValue?.utm_medium}; uc=${queryValue?.utm_campaign}`;
        } else {
            utm = "";
        }
    }

    var client_id = document.querySelector('#fc-collect-19212').getAttribute('data-client-id');

    fetch("https://tr.farziengineer.co/collect", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pu: document.referrer || "",
            cu: window.location.href,
            bi: visitorId,
            ui: getCookie("fc_user_id"),
            ci: client_id,
            ua: window.navigator.userAgent,
            uip: ip,
            utm: utm,
            tz: clientTimeZone,
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res?.data?.ui) {
                setCookie("fc_user_id", res?.data?.ui, 365);
            }
        })
        .catch((err) => {
            console.log("fc collect error:", err);
        });
}

pageViewTrack();