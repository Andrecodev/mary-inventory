/*
  # Auto-Update Customer/Supplier Debt Totals

  ## Changes
  1. Create function to calculate customer total debt from receivables
  2. Create function to calculate supplier total owed from payables
  3. Create triggers to auto-update totals when transactions change

  ## Details
  - Updates customer.total_debt automatically based on account_transactions
  - Updates supplier.total_owed automatically based on account_transactions
  - Triggers fire on INSERT, UPDATE, DELETE of account_transactions
*/

-- Function to update customer total debt
CREATE OR REPLACE FUNCTION update_customer_total_debt()
RETURNS TRIGGER AS $$
BEGIN
  -- Update for the affected customer (works for both NEW and OLD)
  IF TG_OP = 'DELETE' THEN
    -- On delete, use OLD record
    IF OLD.customer_id IS NOT NULL THEN
      UPDATE customers
      SET total_debt = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE customer_id = OLD.customer_id
          AND type = 'receivable'
          AND status != 'paid'
      ), 0)
      WHERE id = OLD.customer_id;
    END IF;
    RETURN OLD;
  ELSE
    -- On insert or update, use NEW record
    IF NEW.customer_id IS NOT NULL THEN
      UPDATE customers
      SET total_debt = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE customer_id = NEW.customer_id
          AND type = 'receivable'
          AND status != 'paid'
      ), 0)
      WHERE id = NEW.customer_id;
    END IF;

    -- Also update the old customer if customer_id changed
    IF TG_OP = 'UPDATE' AND OLD.customer_id IS NOT NULL AND OLD.customer_id != NEW.customer_id THEN
      UPDATE customers
      SET total_debt = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE customer_id = OLD.customer_id
          AND type = 'receivable'
          AND status != 'paid'
      ), 0)
      WHERE id = OLD.customer_id;
    END IF;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update supplier total owed
CREATE OR REPLACE FUNCTION update_supplier_total_owed()
RETURNS TRIGGER AS $$
BEGIN
  -- Update for the affected supplier (works for both NEW and OLD)
  IF TG_OP = 'DELETE' THEN
    -- On delete, use OLD record
    IF OLD.supplier_id IS NOT NULL THEN
      UPDATE suppliers
      SET total_owed = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE supplier_id = OLD.supplier_id
          AND type = 'payable'
          AND status != 'paid'
      ), 0)
      WHERE id = OLD.supplier_id;
    END IF;
    RETURN OLD;
  ELSE
    -- On insert or update, use NEW record
    IF NEW.supplier_id IS NOT NULL THEN
      UPDATE suppliers
      SET total_owed = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE supplier_id = NEW.supplier_id
          AND type = 'payable'
          AND status != 'paid'
      ), 0)
      WHERE id = NEW.supplier_id;
    END IF;

    -- Also update the old supplier if supplier_id changed
    IF TG_OP = 'UPDATE' AND OLD.supplier_id IS NOT NULL AND OLD.supplier_id != NEW.supplier_id THEN
      UPDATE suppliers
      SET total_owed = COALESCE((
        SELECT SUM(remaining_amount)
        FROM account_transactions
        WHERE supplier_id = OLD.supplier_id
          AND type = 'payable'
          AND status != 'paid'
      ), 0)
      WHERE id = OLD.supplier_id;
    END IF;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for customer debt
DROP TRIGGER IF EXISTS trigger_update_customer_debt ON account_transactions;
CREATE TRIGGER trigger_update_customer_debt
  AFTER INSERT OR UPDATE OR DELETE ON account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_total_debt();

-- Create triggers for supplier owed
DROP TRIGGER IF EXISTS trigger_update_supplier_owed ON account_transactions;
CREATE TRIGGER trigger_update_supplier_owed
  AFTER INSERT OR UPDATE OR DELETE ON account_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_total_owed();

-- Initialize existing customer debts
UPDATE customers c
SET total_debt = COALESCE((
  SELECT SUM(remaining_amount)
  FROM account_transactions
  WHERE customer_id = c.id
    AND type = 'receivable'
    AND status != 'paid'
), 0);

-- Initialize existing supplier owed amounts
UPDATE suppliers s
SET total_owed = COALESCE((
  SELECT SUM(remaining_amount)
  FROM account_transactions
  WHERE supplier_id = s.id
    AND type = 'payable'
    AND status != 'paid'
), 0);

-- Add comments for documentation
COMMENT ON FUNCTION update_customer_total_debt() IS 'Automatically updates customer total_debt based on receivable transactions';
COMMENT ON FUNCTION update_supplier_total_owed() IS 'Automatically updates supplier total_owed based on payable transactions';
