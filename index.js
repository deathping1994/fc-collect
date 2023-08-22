// Minify using babel-minify https://jscompress.com/


//Helper functions start
function getCookie(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = document.cookie;
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }
    return "";
  }

function setCookie(cookieName, cookieValue, expirationDays) {
    const d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    cookieValue=encodeURIComponent(cookieValue)
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
//Helper functions end

/////////////////////////////////////////////////


(async function pageViewTrack() {
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
            const res = await fetch("https://tr.farziengineer.co/ip");
            const data = await res.json();
            ip = data?.ip;
            sessionStorage.setItem("fc_ip", data?.ip);
        } catch (err) {
            console.log("err", err);
            ip = ""
        }
    }

    const queryValue = parseQueryString(window.location.search);
    if (
        queryValue?.utm_source ||
        queryValue?.utm_medium ||
        queryValue?.utm_campaign
    ) {
        utm = (queryValue?.utm_source ? `us=${queryValue.utm_source};` : '') +
            (queryValue?.utm_medium ? `um=${queryValue.utm_medium};` : '') +
            (queryValue?.utm_campaign ? `uc=${queryValue.utm_campaign}` : '');
        setCookie("fctrack", utm, 180);
    } else {
        utm = getCookie("fctrack") || "";
        setCookie("fctrack", utm, 180);
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
            ui: getCookie("user_id"),
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
                setCookie("user_id", res?.data?.ui, 365);
            }
        })
        .catch((err) => {
            console.log("fc collect error:", err);
        });
})();//called immediately on script load


/////////////////////////////////////////////////


//attach other event funtions to the global window object to be called from frontend on actions

window.fc_addtocart = async function ({
    product_name,
    product_id,
    quantity,
    product_price,
    currency,
    variant
}) {

    var client_id = document.querySelector('#fc-collect-19212').getAttribute('data-client-id');

    fetch("https://tr.farziengineer.co/collect?evt_type=AddToCart", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ui: getCookie("user_id"),
            ci: client_id,
            product_name,
            product_id,
            quantity,
            product_price,
            currency,
            variant
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res?.data?.ui) {
                setCookie("user_id", res?.data?.ui, 365);
            }
        })
        .catch((err) => {
            console.log("fc collect error:", err);
        });
}


window.fc_purchase = async function ({
    transaction_id,
    order_amount,
    tax,
    shipping_charge,
    currency,
    items,
    coupon_code,
    customer_id,
    pay_method,
    discount_amount
}) {

    var client_id = document.querySelector('#fc-collect-19212').getAttribute('data-client-id');
    var ip;
    if (sessionStorage.getItem("fc_ip")) {
        ip = sessionStorage.getItem("fc_ip");
    } else {
        try {
            const res = await fetch("https://tr.farziengineer.co/ip");
            const data = await res.json();
            ip = data?.ip;
            sessionStorage.setItem("fc_ip", data?.ip);
        } catch (err) {
            console.log("err", err);
            ip = ""
        }
    }

    fetch("https://tr.farziengineer.co/collect?evt_type=Purchase", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ui: getCookie("user_id"),
            ci: client_id,
            transaction_id,
            order_amount,
            tax,
            shipping_charge,
            currency,
            items,
            coupon_code,
            customer_id,
            pay_method,
            discount_amount,
            uip: ip,
            utm: getCookie("fctrack") || ""
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res?.data?.ui) {
                setCookie("user_id", res?.data?.ui, 365);
            }
        })
        .catch((err) => {
            console.log("fc collect error:", err);
        });
}


window.fc_begin_checkout = async function ({
    cart_amount,
    currency,
    items
}) {

    var client_id = document.querySelector('#fc-collect-19212').getAttribute('data-client-id');

    fetch("https://tr.farziengineer.co/collect?evt_type=BeginCheckout", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ui: getCookie("user_id"),
            ci: client_id,
            cart_amount,
            currency,
            items
        }),
    })
        .then((response) => {
            return response.json();
        })
        .then((res) => {
            if (res?.data?.ui) {
                setCookie("user_id", res?.data?.ui, 365);
            }
        })
        .catch((err) => {
            console.log("fc collect error:", err);
        });
}