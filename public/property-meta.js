/* /public/js/property-meta.js
   Enhances property.html with:
   - Highlights (bullet points)
   - Long Description with "Read more / Read less"
   - Feature grid
   - Agent card with avatar (image or initials fallback)
*/
(() => {
    const $ = (sel, root = document) => root.querySelector(sel);
    const list = (items) => {
        if (!Array.isArray(items) || !items.length) return '';
        return `<ul class="highlights">${items.map(li => `<li>${li}</li>`).join('')}</ul>`;
    };

    // ---------------- Agent data (extend if you like) ----------------
    const AGENTS = [
        {
            name: "Ken (Hiroyoshi) Miyagawa",
            rating: 5.0,
            reviews: 18,
            agency: "Richard Matthews Real Estate",
            suburbs: ["Mascot", "Strathfield", "Campsie", "Burwood"],
            avatar: "/Assets/agents/ken.jpg" // If missing, initials fallback is shown
        },
        {
            name: "Adrian William",
            rating: 5.0,
            reviews: 1093,
            agency: "Adrian William",
            suburbs: ["Zetland", "Kogarah", "Marrickville", "Canterbury"],
            avatar: "/Assets/agents/adrian.jpg"
        },
        {
            name: "Denny Barros",
            rating: 5.0,
            reviews: 48,
            agency: "Adrian William",
            suburbs: ["Newtown", "Marrickville", "Burwood"],
            avatar: "/Assets/agents/denny.jpg"
        }
    ];

    function pickAgent(suburb) {
        if (!suburb) return AGENTS[0];
        const s = suburb.toLowerCase();
        const hit = AGENTS.find(a => (a.suburbs || []).some(ss => ss.toLowerCase() === s));
        return hit || AGENTS[0];
    }

    // ---------------- Helpers to build content ----------------
    function makeHighlights(p) {
        const bits = [];
        bits.push(`${p.type || 'Home'} with functional layout`);
        if (p.bedrooms != null) bits.push(`${p.bedrooms} ${p.bedrooms == 1 ? 'bedroom' : 'bedrooms'}`);
        if (p.bathrooms != null) bits.push(`${p.bathrooms} ${p.bathrooms == 1 ? 'bathroom' : 'bathrooms'}`);
        if (p.carspaces != null) bits.push(`${p.carspaces} car ${p.carspaces == 1 ? 'space' : 'spaces'}`);
        if (p.suburb) bits.push(`Convenient ${p.suburb} location`);
        return bits;
    }

    function makeLongDescription(p) {
        // A purposely long, readable description to trigger “Read more”.
        const suburb = p.suburb || "this suburb";
        const type = p.type || "property";
        const beds = p.bedrooms ?? "–";
        const baths = p.bathrooms ?? "–";
        const cars = p.carspaces ?? "–";

        return [
            `Situated in the heart of ${suburb}, this ${type.toLowerCase()} combines a practical floorplan with light-filled interiors, creating an inviting space for daily living and effortless entertaining.`,
            `Key spaces include ${beds} ${beds == 1 ? "bedroom" : "bedrooms"}, ${baths} ${baths == 1 ? "bathroom" : "bathrooms"} and ${cars} ${cars == 1 ? "car space" : "car spaces"}. Generous windows welcome natural light throughout the day, while the main living area offers an easy connection to the dining zone and kitchen.`,
            `Beyond the home, you’ll enjoy quick access to cafes, parks, local schools and reliable public transport. Whether you’re purchasing your first home, investing, or upsizing, this address provides a balanced lifestyle with everyday convenience.`,
            `Additional touches—like built-in storage, easy-care finishes and a flexible layout—help this home adapt to the needs of modern living.`
        ].join('\n\n');
    }

    function makeFeatures(p) {
        const items = [];
        if (p.bedrooms != null) items.push({ label: "Bedrooms", value: String(p.bedrooms) });
        if (p.bathrooms != null) items.push({ label: "Bathrooms", value: String(p.bathrooms) });
        if (p.carspaces != null) items.push({ label: "Parking", value: String(p.carspaces) });
        if (p.type) items.push({ label: "Property type", value: p.type });
        if (p.suburb) items.push({ label: "Suburb", value: p.suburb });
        items.push({ label: "Built-in wardrobes", value: "Yes" });
        items.push({ label: "Open-plan living", value: "Yes" });
        return items;
    }

    // ---------------- Avatar (image + initials fallback) ----------------
    function initialsOf(name) {
        return (name || '')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(w => w[0].toUpperCase())
            .join('');
    }

    function avatarHTML(agent) {
        const initials = initialsOf(agent.name);
        const img = agent.avatar ? `
      <img class="agent-avatar-img"
           src="${agent.avatar}"
           alt="${agent.name}"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">` : '';
        return `
      <div class="agent-avatar">
        ${img}
        <span class="agent-avatar-fallback" aria-hidden="true">${initials}</span>
      </div>`;
    }

    // ---------------- Renderers into existing placeholders ----------------
    function renderHighlights(p) {
        const sec = document.getElementById('prop-highlights');
        if (!sec) return;
        const items = makeHighlights(p);
        if (!items.length) return;
        sec.querySelector('#prop-highlights-list').innerHTML = list(items);
        sec.hidden = false;
    }

    function renderLongDesc(p) {
        const sec = document.getElementById('prop-longdesc');
        if (!sec) return;
        const body = document.getElementById('prop-longdesc-body');
        const toggle = document.getElementById('prop-longdesc-toggle');
        const text = makeLongDescription(p);

        // build paragraphs
        body.innerHTML = text.split(/\n{2,}/).map(t => `<p>${t}</p>`).join('');

        // clamp/expand handler
        let expanded = false;
        const applyClamp = () => {
            body.classList.toggle('clamp-8', !expanded); // clamp to 8 lines when collapsed
            toggle.textContent = expanded ? 'Read less' : 'Read more';
        };
        toggle.onclick = () => {
            expanded = !expanded;
            applyClamp();
        };

        applyClamp();
        sec.hidden = false;
    }

    function renderFeatures(p) {
        const sec = document.getElementById('prop-features');
        if (!sec) return;
        const grid = document.getElementById('prop-features-grid');
        const feat = makeFeatures(p);
        grid.innerHTML = feat
            .map(f => `<div class="feature-item"><div class="feature-k">${f.label}:</div><div class="feature-v">${f.value}</div></div>`)
            .join('');
        sec.hidden = false;
    }

    function renderAgent(p) {
        const sec = document.getElementById('prop-agent');
        if (!sec) return;
        const a = pickAgent(p.suburb);

        sec.innerHTML = `
      <div class="agent-card">
        ${avatarHTML(a)}
        <div class="agent-body">
          <div class="agent-name">${a.name}</div>
          <div class="agent-meta">
            <span class="agent-star">★</span>
            <span>${a.rating.toFixed(1)} (${a.reviews} reviews)</span>
          </div>
          <div class="agent-agency">${a.agency} • ${p.suburb || ''}</div>

          <div class="agent-actions">
            <a class="btn-primary-sm" href="/enquire.html?suburb=${encodeURIComponent(p.suburb || '')}">Request a free appraisal</a>
            <a class="btn-sm" href="/enquire.html?suburb=${encodeURIComponent(p.suburb || '')}&agent=${encodeURIComponent(a.name)}">Get in touch</a>
          </div>
        </div>
      </div>
    `;
        sec.hidden = false;
    }

    // Public entry point called by property.html after main panel renders
    window.renderPropertyMeta = function (p) {
        try {
            // Remove any existing inline description from the right panel to avoid duplication
            const right = document.querySelector('.prop-panel');
            if (right) {
                right.querySelectorAll('.label')?.forEach(l => {
                    if (l.textContent.trim().toLowerCase() === 'description') {
                        l.parentElement?.remove();
                    }
                });
            }

            renderHighlights(p);
            renderLongDesc(p);
            renderFeatures(p);
            renderAgent(p);
        } catch (e) {
            console.warn('property-meta error', e);
        }
    };
})();
