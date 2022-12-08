(() => {
  // src/cms/populate-external-data/index.ts
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    "cmsfilter",
    async (filtersInstances) => {
      const [filtersInstance] = filtersInstances;
      const { listInstance } = filtersInstance;
      const [firstItem] = listInstance.items;
      const itemTemplateElement = firstItem.element;
      const episodes = await fetchEpisodes();
      listInstance.clearItems();
      const newItems = episodes.map((episode) => createItem(episode, itemTemplateElement));
      await listInstance.addItems(newItems);
      const filterTemplateElement = filtersInstance.form.querySelector('[data-element="filter"]');
      if (!filterTemplateElement)
        return;
      const filtersWrapper = filterTemplateElement.parentElement;
      if (!filtersWrapper)
        return;
      filterTemplateElement.remove();
      const categories = collectCategories(episodes);
      for (const category of categories) {
        const newFilter = createFilter(category, filterTemplateElement);
        if (!newFilter)
          continue;
        filtersWrapper.append(newFilter);
      }
      filtersInstance.storeFiltersData();
    }
  ]);
  var fetchEpisodes = async () => {
    try {
      const response = await fetch("https://localeyz.directus.app/items/episodes?filter[organization_id][_eq]=2&sort=-date_of_production&limit=100&fields[]=title,program_id.title,thumbnail_url,episodeSlug,short_description,id&filter[published][_eq]=1");
      const data = await response.json();
      return data.data;
    } catch (error) {
      return [];
    }
  };
  var createItem = (episode, templateElement) => {
    const newItem = templateElement.cloneNode(true);
    const image = newItem.querySelector('[data-element="image"]');
    const title = newItem.querySelector('[data-element="title"]');
    const category = newItem.querySelector('[data-element="category"]');
    const description = newItem.querySelector('[data-element="description"]');
    if (image)
      image.src = episode.thumbnail_url;
    if (title)
      title.textContent = episode.title + " - " + String(episode.id);
    if (category)
      category.textContent = episode.category;
    if (description)
      description.textContent = episode.short_description;
    return newItem;
  };
  var collectCategories = (episode) => {
    const categories = /* @__PURE__ */ new Set();
    for (const { category } of episode) {
      categories.add(category);
    }
    return [...categories];
  };
  var createFilter = (category, templateElement) => {
    const newFilter = templateElement.cloneNode(true);
    const label = newFilter.querySelector("span");
    const radio = newFilter.querySelector("input");
    if (!label || !radio)
      return;
    label.textContent = category;
    radio.value = category;
    return newFilter;
  };
})();
