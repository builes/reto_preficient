export const getResources = (req, res) => {
  res.json({ message: "List of resources" });
};

export const createResource = (req, res) => {
  res.json({ message: "Resource created" });
};

export const getResourceById = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Resource with ID: ${id}` });
};

export const updateResource = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Resource with ID: ${id} updated` });
};

export const deleteResource = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Resource with ID: ${id} deleted` });
};
