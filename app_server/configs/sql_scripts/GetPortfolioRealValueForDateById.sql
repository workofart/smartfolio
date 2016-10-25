-- FUNCTION: public.GetPortfolioRealValueForDateById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioRealValueForDateById(integer, date);

CREATE OR REPLACE FUNCTION public.GetPortfolioRealValueForDateById
(
    s_portfolioid INTEGER,
    s_date DATE
)
RETURNS TABLE (
    ticker VARCHAR(8),
    value NUMERIC
)
AS
$$
BEGIN
	-- Get Position for each ticker
	DROP TABLE IF EXISTS StockQuantity;
	CREATE TEMP TABLE StockQuantity (
    	ticker VARCHAR(8),
    	quantity BIGINT
    );

	INSERT INTO StockQuantity (ticker, quantity)
    SELECT DISTINCT ON (T.ticker)
        T.ticker, T.position
    FROM transactions AS T
    WHERE T.portfolioid = s_portfolioid
      AND date(T.datetime) <= s_date
    ORDER BY T.ticker, T.transactionid DESC;

	-- Get latest price for each ticker
	DROP TABLE IF EXISTS PriceTable;
	CREATE TEMP TABLE PriceTable (
    	ticker VARCHAR(8),
    	price NUMERIC
    );
    
    INSERT INTO PriceTable (ticker, price)
    SELECT DISTINCT ON (SD.ticker)
    	SD.ticker, SD.close
    FROM stock_daily AS SD
    WHERE date(SD.datetime) <= s_date
    ORDER BY SD.ticker, SD.insertid DESC;

	-- Get Price * Position for each ticker
    DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        ticker VARCHAR(8),
        value NUMERIC
    );

    INSERT INTO OutputTable (ticker, value)
    SELECT
    	SQ.ticker,
        SQ.quantity * PT.price
    FROM StockQuantity AS SQ
    INNER JOIN PriceTable AS PT ON SQ.ticker = PT.ticker;

	-- Add cash balance into output
    INSERT INTO OutputTable (ticker, value)
    SELECT
        T.ticker,
        Sum(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker = 'RESERVE'
      AND date(T.datetime) <= s_date
    GROUP BY T.ticker;

    RETURN QUERY
    SELECT *
    FROM OutputTable;
    
END;
$$

LANGUAGE 'plpgsql'