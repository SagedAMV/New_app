export default {
  sites: [
    { id: 'site-1', name: 'Site Alpha', location: 'Area 51', notes: '' },
    { id: 'site-2', name: 'Site Beta', location: 'Area 52', notes: '' }
  ],
  tasks: [
    { id: 'task-1', siteId: 'site-1', title: 'Inspect fence', done: false },
    { id: 'task-2', siteId: 'site-2', title: 'Collect sample', done: false }
  ],
  materials: [
    { id: 'mat-1', name: 'Cement bag', qty: 10 },
    { id: 'mat-2', name: 'Pipes', qty: 5 }
  ],
  movements: [
    { id: 'mov-1', siteId: 'site-1', description: 'Moved crew A', timestamp: Date.now() }
  ],
  investigations: [
    { id: 'inv-1', siteId: 'site-2', description: 'Soil analysis pending', timestamp: Date.now() }
  ]
};
