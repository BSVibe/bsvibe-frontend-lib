import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveTable, type ResponsiveTableColumn } from './ResponsiveTable.js';

interface Row {
  id: string;
  name: string;
  status: 'active' | 'archived';
  count: number;
}

const ROWS: Row[] = [
  { id: 'r1', name: 'Alpha', status: 'active', count: 10 },
  { id: 'r2', name: 'Beta', status: 'archived', count: 4 },
];

const COLS: ResponsiveTableColumn<Row>[] = [
  { key: 'name', header: 'Name', cell: (r) => r.name },
  { key: 'status', header: 'Status', cell: (r) => r.status },
  { key: 'count', header: 'Count', cell: (r) => String(r.count) },
];

describe('<ResponsiveTable>', () => {
  it('renders a <table> with one row per data item on desktop', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // 2 data rows + 1 header row.
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);
  });

  it('renders one column header per `columns[]` entry', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Count' })).toBeInTheDocument();
  });

  it('applies column.cell() to each cell value', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    // Both desktop table cells and mobile cards live in the DOM. Each value
    // therefore appears twice — assert presence via *AllByText.
    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('renders a mobile card stack alongside the desktop table (Tailwind toggles visibility)', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    // The component renders BOTH layouts; CSS (sm:hidden / hidden sm:table)
    // chooses which one is visible. Test asserts both are in the DOM.
    const cardList = screen.getByTestId('bsvibe-table-mobile');
    expect(cardList).toBeInTheDocument();
    expect(cardList.className).toMatch(/sm:hidden/);

    const tableEl = screen.getByRole('table');
    expect(tableEl.className).toMatch(/hidden sm:table|sm:table/);
  });

  it('mobile card stack renders one card per row by default (key/value list)', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    const cards = screen.getAllByTestId('bsvibe-table-card');
    expect(cards).toHaveLength(2);
    // First card has each column label + value visible.
    const card1 = cards[0];
    expect(card1.textContent).toContain('Name');
    expect(card1.textContent).toContain('Alpha');
    expect(card1.textContent).toContain('Status');
    expect(card1.textContent).toContain('active');
  });

  it('uses renderMobileCard prop to fully customize mobile card markup', () => {
    render(
      <ResponsiveTable<Row>
        columns={COLS}
        rows={ROWS}
        rowKey={(r) => r.id}
        renderMobileCard={(row) => (
          <article data-testid="custom-card" key={row.id}>
            <h3>{row.name}</h3>
            <p>{row.status}</p>
          </article>
        )}
      />,
    );
    const cards = screen.getAllByTestId('custom-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('h3')?.textContent).toBe('Alpha');
  });

  it('renders empty state when rows is empty', () => {
    render(
      <ResponsiveTable<Row>
        columns={COLS}
        rows={[]}
        rowKey={(r) => r.id}
        emptyMessage="No data yet"
      />,
    );
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('falls back to a default empty message when none is provided', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={[]} rowKey={(r) => r.id} />);
    // Default message is informational copy — accept any non-empty string.
    expect(screen.getByTestId('bsvibe-table-empty')).toBeInTheDocument();
  });

  it('rowKey is used to set a stable React key on each row', () => {
    // Sanity test: using id as key shouldn't blow up; presence of unique ids
    // ensures no duplicate-key console warnings would surface.
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('forwards extra className onto the wrapper container', () => {
    const { container } = render(
      <ResponsiveTable<Row>
        columns={COLS}
        rows={ROWS}
        rowKey={(r) => r.id}
        className="my-custom"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/my-custom/);
  });

  it('table has horizontal-scroll wrapper to handle overflow on small viewports', () => {
    render(<ResponsiveTable<Row> columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    const scrollWrap = screen.getByTestId('bsvibe-table-scroll');
    // overflow-x-auto + min-w-full guarantees a horizontal scroll affordance
    // when columns exceed viewport width.
    expect(scrollWrap.className).toMatch(/overflow-x-auto/);
  });
});
