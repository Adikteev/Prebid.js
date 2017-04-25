// if $$PREBID_GLOBAL$$ already exists in global document scope, use it, if not, create the object
// global defination should happen BEFORE imports to avoid global undefined errors.
window.$$PREBID_GLOBAL$$ = (window.$$PREBID_GLOBAL$$ || {});
window.$$PREBID_GLOBAL$$.queue = window.$$PREBID_GLOBAL$$.queue || [];
window.$$PREBID_GLOBAL$$.que = window.$$PREBID_GLOBAL$$.que || window.$$PREBID_GLOBAL$$.queue;


export function getGlobal() {
  return window.$$PREBID_GLOBAL$$;
}
